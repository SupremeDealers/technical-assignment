import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import {
  getTaskTemplates,
  createTaskTemplate,
  deleteTaskTemplate,
  TaskTemplate,
  Priority,
} from "../../api/client";
import { Button } from "../../components/Button";
import { Input, Textarea, Select } from "../../components/Input";
import { Modal } from "../../components/Modal";
import { Loading } from "../../components/Loading";
import { FiFileText } from "react-icons/fi";
import "./TaskTemplates.css";

// Default templates that are always available
const DEFAULT_TEMPLATES: Omit<TaskTemplate, "id" | "board_id" | "created_by" | "created_at" | "updated_at">[] = [
  {
    name: "Bug Report",
    title: "[Bug] ",
    description: "## Bug Description\n\n## Steps to Reproduce\n1. \n2. \n3. \n\n## Expected Behavior\n\n## Actual Behavior\n\n## Environment\n- Browser: \n- OS: ",
    priority: "high" as Priority,
    labels: "bug",
    checklist_items: JSON.stringify(["Reproduce the bug", "Identify root cause", "Write fix", "Test fix", "Update documentation"]),
    estimated_hours: 4,
  },
  {
    name: "Feature Request",
    title: "[Feature] ",
    description: "## Feature Description\n\n## Use Case\n\n## Acceptance Criteria\n- [ ] \n- [ ] \n\n## Technical Notes\n",
    priority: "medium" as Priority,
    labels: "feature,enhancement",
    checklist_items: JSON.stringify(["Design review", "Implementation", "Testing", "Documentation", "Code review"]),
    estimated_hours: 8,
  },
  {
    name: "Tech Debt",
    title: "[Tech Debt] ",
    description: "## Problem\n\n## Proposed Solution\n\n## Impact\n- Performance: \n- Maintainability: \n- Developer Experience: ",
    priority: "low" as Priority,
    labels: "tech-debt,refactor",
    checklist_items: JSON.stringify(["Analyze current state", "Plan refactor", "Implement changes", "Run tests", "Update docs"]),
    estimated_hours: 6,
  },
  {
    name: "Documentation",
    title: "[Docs] ",
    description: "## Documentation Type\n- [ ] API Documentation\n- [ ] User Guide\n- [ ] Developer Guide\n- [ ] README\n\n## Scope\n\n## Notes\n",
    priority: "low" as Priority,
    labels: "documentation",
    checklist_items: JSON.stringify(["Outline content", "Write draft", "Review", "Publish"]),
    estimated_hours: 3,
  },
];

interface TaskTemplatesProps {
  boardId: string;
  onSelectTemplate: (template: {
    title: string;
    description: string;
    priority: Priority;
    labels: string | null;
    checklist_items?: string[];
  }) => void;
  onClose: () => void;
}

export function TaskTemplates({ boardId, onSelectTemplate, onClose }: TaskTemplatesProps) {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | typeof DEFAULT_TEMPLATES[0] | null>(null);

  // Form state for creating new template
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formLabels, setFormLabels] = useState("");

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ["task-templates", boardId],
    queryFn: () => getTaskTemplates(token!, boardId),
    enabled: !!token,
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: Parameters<typeof createTaskTemplate>[2]) =>
      createTaskTemplate(token!, boardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates", boardId] });
      setShowCreateForm(false);
      resetForm();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: string) => deleteTaskTemplate(token!, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-templates", boardId] });
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormTitle("");
    setFormDescription("");
    setFormPriority("medium");
    setFormLabels("");
  };

  const handleSelectTemplate = (template: TaskTemplate | typeof DEFAULT_TEMPLATES[0]) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;

    let checklistItems: string[] = [];
    if (selectedTemplate.checklist_items) {
      try {
        checklistItems = JSON.parse(selectedTemplate.checklist_items);
      } catch {
        // Ignore parse errors
      }
    }

    onSelectTemplate({
      title: selectedTemplate.title,
      description: selectedTemplate.description || "",
      priority: selectedTemplate.priority,
      labels: selectedTemplate.labels,
      checklist_items: checklistItems,
    });
    onClose();
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    createTemplateMutation.mutate({
      name: formName,
      title: formTitle,
      description: formDescription,
      priority: formPriority,
      labels: formLabels || null,
    });
  };

  const customTemplates = templatesData?.templates || [];
  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];

  if (showCreateForm) {
    return (
      <Modal isOpen onClose={() => setShowCreateForm(false)} title="Create Template">
        <form onSubmit={handleCreateTemplate} className="template-form">
          <Input
            label="Template Name"
            placeholder="e.g., Sprint Task"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Default Title Prefix"
            placeholder="e.g., [Sprint] "
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description Template"
            placeholder="Enter the default description..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            rows={4}
          />
          <Select
            label="Default Priority"
            value={formPriority}
            onChange={(e) => setFormPriority(e.target.value as Priority)}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />
          <Input
            label="Default Labels"
            placeholder="e.g., sprint, backend"
            value={formLabels}
            onChange={(e) => setFormLabels(e.target.value)}
          />
          <div className="template-form-actions">
            <Button type="submit" variant="primary" loading={createTemplateMutation.isPending}>
              Create Template
            </Button>
            <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  if (selectedTemplate) {
    let checklistItems: string[] = [];
    if (selectedTemplate.checklist_items) {
      try {
        checklistItems = JSON.parse(selectedTemplate.checklist_items);
      } catch {
        // Ignore parse errors
      }
    }

    return (
      <Modal isOpen onClose={onClose} title="Template Preview">
        <div className="template-preview">
          <h3 className="template-preview-name">
            {"name" in selectedTemplate ? selectedTemplate.name : "Template"}
          </h3>
          <div className="template-preview-field">
            <label>Title:</label>
            <span>{selectedTemplate.title || "(No title prefix)"}</span>
          </div>
          <div className="template-preview-field">
            <label>Description:</label>
            <pre className="template-preview-description">
              {selectedTemplate.description || "(No description)"}
            </pre>
          </div>
          <div className="template-preview-row">
            <div className="template-preview-field">
              <label>Priority:</label>
              <span className={`badge badge-priority-${selectedTemplate.priority}`}>
                {selectedTemplate.priority}
              </span>
            </div>
            {selectedTemplate.labels && (
              <div className="template-preview-field">
                <label>Labels:</label>
                <div className="template-labels">
                  {selectedTemplate.labels.split(",").map((label, idx) => (
                    <span key={idx} className="badge badge-label">
                      {label.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {checklistItems.length > 0 && (
            <div className="template-preview-field">
              <label>Checklist:</label>
              <ul className="template-checklist">
                {checklistItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="template-preview-actions">
            <Button variant="primary" onClick={handleUseTemplate}>
              Use This Template
            </Button>
            <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
              Back to Templates
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={onClose} title="Choose a Template">
      <div className="templates-container">
        {isLoading ? (
          <Loading size="sm" text="Loading templates..." />
        ) : (
          <>
            <div className="templates-grid">
              {allTemplates.map((template, index) => {
                const templateId = "id" in template ? (template as TaskTemplate).id : `default-${index}`;
                const isCustom = "id" in template;
                
                return (
                  <button
                    key={templateId}
                    className="template-card"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="template-card-header">
                      <span className="template-card-name">{template.name}</span>
                      <span className={`badge badge-priority-${template.priority}`}>
                        {template.priority}
                      </span>
                    </div>
                    <p className="template-card-title">{template.title}</p>
                    {template.labels && (
                      <div className="template-card-labels">
                        {template.labels.split(",").slice(0, 3).map((label, idx) => (
                          <span key={idx} className="badge badge-label badge-sm">
                            {label.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {isCustom && (
                      <button
                        className="template-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Delete this template?")) {
                            deleteTemplateMutation.mutate((template as TaskTemplate).id);
                          }
                        }}
                      >
                        ×
                      </button>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="templates-footer">
              <Button variant="secondary" onClick={() => setShowCreateForm(true)}>
                + Create Custom Template
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
