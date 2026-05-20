'use client';

import { useMemo } from 'react';
import { ArrowRight, Send, Check, Archive, Users } from 'lucide-react';
import Button from '../ui/button';
import { useRole } from '../../hooks/use-role';
import type { InvestigationViewModel } from '../../types/investigations';

interface WorkflowActionButtonProps {
  investigation: InvestigationViewModel;
  onAssignAnalyst?: () => void;
  onRequestEvidence?: () => void;
  onMarkReady?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  isLoading?: boolean;
}

export function WorkflowActionButtons({
  investigation,
  onAssignAnalyst,
  onRequestEvidence,
  onMarkReady,
  onPublish,
  onArchive,
  isLoading = false
}: WorkflowActionButtonProps) {
  const role = useRole();

  // Determine which actions are available based on role and status
  const canAssignAnalyst = useMemo(() => role === 'ADMIN' || role === 'REVIEWER', [role]);
  const canRequestEvidence = useMemo(() => role === 'ANALYST' || role === 'REVIEWER' || role === 'ADMIN', [role]);
  const canMarkReady = useMemo(() => role === 'ANALYST', [role]);
  const canPublish = useMemo(() => role === 'REVIEWER' || role === 'ADMIN', [role]);
  const canArchive = useMemo(() => role === 'ADMIN', [role]);

  const actions = useMemo(
    () => [
      {
        id: 'assign',
        label: 'Assign Analyst',
        icon: <Users className="w-4 h-4" />,
        onClick: onAssignAnalyst,
        visible: canAssignAnalyst && !investigation.assignedAnalystId,
        disabled: !onAssignAnalyst || isLoading,
        primary: true
      },
      {
        id: 'request-evidence',
        label: 'Request More Evidence',
        icon: <Send className="w-4 h-4" />,
        onClick: onRequestEvidence,
        visible: canRequestEvidence && investigation.status === 'IN_PROGRESS',
        disabled: !onRequestEvidence || isLoading,
        primary: false
      },
      {
        id: 'mark-ready',
        label: 'Mark Ready for Review',
        icon: <Check className="w-4 h-4" />,
        onClick: onMarkReady,
        visible: canMarkReady && investigation.status === 'IN_PROGRESS',
        disabled: !onMarkReady || isLoading,
        primary: true
      },
      {
        id: 'publish',
        label: 'Publish Verdict',
        icon: <ArrowRight className="w-4 h-4" />,
        onClick: onPublish,
        visible: canPublish && investigation.verdictReadiness >= 85,
        disabled: !onPublish || isLoading,
        primary: true
      },
      {
        id: 'archive',
        label: 'Archive Claim',
        icon: <Archive className="w-4 h-4" />,
        onClick: onArchive,
        visible: canArchive,
        disabled: !onArchive || isLoading,
        primary: false
      }
    ],
    [
      canAssignAnalyst,
      canRequestEvidence,
      canMarkReady,
      canPublish,
      canArchive,
      investigation,
      isLoading,
      onAssignAnalyst,
      onRequestEvidence,
      onMarkReady,
      onPublish,
      onArchive
    ]
  );

  const visibleActions = actions.filter((a) => a.visible);

  if (visibleActions.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
        No actions available in current workflow state
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visibleActions.map((action) => (
        <Button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          variant={action.primary ? 'default' : 'outline'}
          className="flex items-center gap-2"
          title={action.label}
        >
          {action.icon}
          <span>{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
