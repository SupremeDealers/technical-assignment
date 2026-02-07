import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { search, SearchTaskResult, SearchCommentResult } from "../../api/client";
import { FiSearch, FiClipboard, FiMessageSquare } from "react-icons/fi";
import "./SmartSearch.css";

interface SmartSearchProps {
  boardId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

function highlightMatch(text: string, query: string): React.ReactElement {
  if (!query.trim()) return <>{text}</>;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function SmartSearch({ boardId, onClose, isModal = false }: SmartSearchProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as "all" | "tasks" | "comments") || "all";
  
  const [inputValue, setInputValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"all" | "tasks" | "comments">(initialType);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
      setSelectedIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Sync to URL (only when not in modal mode)
  useEffect(() => {
    if (!isModal && debouncedQuery) {
      const params = new URLSearchParams();
      params.set("q", debouncedQuery);
      if (searchType !== "all") params.set("type", searchType);
      setSearchParams(params, { replace: true });
    }
  }, [debouncedQuery, searchType, isModal, setSearchParams]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ["search", debouncedQuery, searchType, boardId],
    queryFn: () =>
      search(token!, {
        q: debouncedQuery,
        boardId,
        type: searchType,
        limit: 20,
      }),
    enabled: !!token && debouncedQuery.length >= 2,
    staleTime: 30000,
  });

  const allResults = [
    ...(searchResults?.results.tasks || []).map(t => ({ ...t, resultType: "task" as const })),
    ...(searchResults?.results.comments || []).map(c => ({ ...c, resultType: "comment" as const })),
  ];

  const handleResultClick = useCallback((result: (SearchTaskResult | SearchCommentResult) & { resultType: "task" | "comment" }) => {
    if (result.resultType === "task") {
      const taskResult = result as SearchTaskResult;
      navigate(`/boards/${taskResult.board_id}?task=${taskResult.id}`);
    } else {
      const commentResult = result as SearchCommentResult;
      navigate(`/boards/${commentResult.board_id}?task=${commentResult.task_id}`);
    }
    onClose?.();
  }, [navigate, onClose]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose?.();
      return;
    }
    
    if (allResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
    }
  }, [allResults, selectedIndex, handleResultClick, onClose]);

  // Scroll selected result into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const renderTaskResult = (task: SearchTaskResult, index: number) => (
    <div
      key={`task-${task.id}`}
      data-index={index}
      className={`search-result search-result-task ${selectedIndex === index ? "selected" : ""}`}
      onClick={() => handleResultClick({ ...task, resultType: "task" })}
      role="option"
      aria-selected={selectedIndex === index}
    >
      <div className="result-icon"><FiClipboard /></div>
      <div className="result-content">
        <div className="result-title">
          {highlightMatch(task.title, debouncedQuery)}
        </div>
        <div className="result-meta">
          <span className={`result-priority priority-${task.priority}`}>
            {task.priority}
          </span>
          <span className={`result-status status-${task.status}`}>
            {task.status.replace("_", " ")}
          </span>
          {!boardId && (
            <span className="result-board">{task.board_name}</span>
          )}
          <span className="result-column">in {task.column_name}</span>
        </div>
        {task.match_type !== "title" && task.match_context && (
          <div className="result-context">
            {highlightMatch(task.match_context, debouncedQuery)}
          </div>
        )}
      </div>
    </div>
  );

  const renderCommentResult = (comment: SearchCommentResult, index: number) => (
    <div
      key={`comment-${comment.id}`}
      data-index={index}
      className={`search-result search-result-comment ${selectedIndex === index ? "selected" : ""}`}
      onClick={() => handleResultClick({ ...comment, resultType: "comment" })}
      role="option"
      aria-selected={selectedIndex === index}
    >
      <div className="result-icon"><FiMessageSquare /></div>
      <div className="result-content">
        <div className="result-title">
          Comment on "{comment.task_title}"
        </div>
        <div className="result-meta">
          <span className="result-author">by {comment.author_name}</span>
          {!boardId && (
            <span className="result-board">{comment.board_name}</span>
          )}
          <span className="result-date">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        <div className="result-context">
          {highlightMatch(comment.match_context, debouncedQuery)}
        </div>
      </div>
    </div>
  );

  const containerClass = isModal ? "smart-search smart-search-modal" : "smart-search";

  return (
    <div className={containerClass}>
      <div className="search-header">
        <div className="search-input-wrapper">
          <span className="search-icon"><FiSearch /></span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={boardId ? "Search this board..." : "Search all boards..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            autoComplete="off"
          />
          {inputValue && (
            <button
              className="search-clear"
              onClick={() => {
                setInputValue("");
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="search-filters">
          <button
            className={`filter-btn ${searchType === "all" ? "active" : ""}`}
            onClick={() => setSearchType("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${searchType === "tasks" ? "active" : ""}`}
            onClick={() => setSearchType("tasks")}
          >
            Tasks
          </button>
          <button
            className={`filter-btn ${searchType === "comments" ? "active" : ""}`}
            onClick={() => setSearchType("comments")}
          >
            Comments
          </button>
        </div>

        {isModal && (
          <button className="search-close" onClick={onClose} aria-label="Close search">
            ×
          </button>
        )}
      </div>

      <div className="search-results" ref={resultsRef} role="listbox">
        {debouncedQuery.length < 2 && (
          <div className="search-hint">
            Type at least 2 characters to search...
          </div>
        )}

        {isLoading && debouncedQuery.length >= 2 && (
          <div className="search-loading">
            <span className="spinner">⟳</span> Searching...
          </div>
        )}

        {error && (
          <div className="search-error">
            Failed to search. Please try again.
          </div>
        )}

        {searchResults && !isLoading && (
          <>
            {searchResults.total === 0 ? (
              <div className="search-empty">
                No results found for "{debouncedQuery}"
              </div>
            ) : (
              <>
                <div className="search-count">
                  Found {searchResults.total} result{searchResults.total !== 1 ? "s" : ""}
                </div>

                {searchType !== "comments" && searchResults.results.tasks.length > 0 && (
                  <div className="result-section">
                    {searchType === "all" && (
                      <div className="result-section-title">
                        Tasks ({searchResults.results.tasks.length})
                      </div>
                    )}
                    {searchResults.results.tasks.map((task, i) => renderTaskResult(task, i))}
                  </div>
                )}

                {searchType !== "tasks" && searchResults.results.comments.length > 0 && (
                  <div className="result-section">
                    {searchType === "all" && (
                      <div className="result-section-title">
                        Comments ({searchResults.results.comments.length})
                      </div>
                    )}
                    {searchResults.results.comments.map((comment, i) =>
                      renderCommentResult(comment, i + (searchType === "all" ? searchResults.results.tasks.length : 0))
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="search-footer">
        <div className="keyboard-hints">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>Enter</kbd> select</span>
          <span><kbd>Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// Global search modal that can be triggered with keyboard shortcut
export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal-container" onClick={(e) => e.stopPropagation()}>
        <SmartSearch onClose={onClose} isModal />
      </div>
    </div>
  );
}
