"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Building2, Users, Factory, Briefcase, Calculator, ShoppingCart, Megaphone, GraduationCap, Wrench } from "lucide-react";
import { organizationData, OrganizationNode } from "../mock/organization";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface OrganizationTreeProps {
  onSelect: (node: OrganizationNode) => void;
  selectedNodeId: string;
}

const getIconForNode = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("company")) return <Building2 className="w-4 h-4" />;
  if (n.includes("operations") || n.includes("zone") || n.includes("region")) return <Factory className="w-4 h-4" />;
  if (n.includes("hr")) return <Users className="w-4 h-4" />;
  if (n.includes("management") || n.includes("cto")) return <Briefcase className="w-4 h-4" />;
  if (n.includes("finance")) return <Calculator className="w-4 h-4" />;
  if (n.includes("procurement")) return <ShoppingCart className="w-4 h-4" />;
  if (n.includes("marketing")) return <Megaphone className="w-4 h-4" />;
  if (n.includes("learning") || n.includes("l&d")) return <GraduationCap className="w-4 h-4" />;
  if (n.includes("admin")) return <Wrench className="w-4 h-4" />;
  return <Building2 className="w-4 h-4" />;
};

const getRootColor = (name: string, isSelected: boolean) => {
  const base = cn("my-0.5 border transition-all", isSelected ? "font-semibold shadow-sm border-indigo-200 dark:border-indigo-800" : "font-medium border-transparent");
  
  if (isSelected) {
    // A pronounced blue/indigo style when selected
    return cn(base, "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100");
  }
  
  // A subtle blue/indigo tint for all unselected root departments
  return cn(base, "bg-indigo-50/80 text-indigo-800 hover:bg-indigo-100/80 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40");
};

const TreeNode = ({
  node,
  level = 0,
  onSelect,
  selectedNodeId,
}: {
  node: OrganizationNode;
  level?: number;
  onSelect: (node: OrganizationNode) => void;
  selectedNodeId: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedNodeId === node.id;

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-all duration-200",
          level === 0
            ? isSelected ? "bg-accent text-accent-foreground font-bold shadow-sm border border-border/40" : "text-foreground font-bold hover:bg-muted/50"
            : level === 1
            ? getRootColor(node.name, isSelected)
            : isSelected 
              ? "bg-accent text-accent-foreground font-semibold shadow-sm border border-border/40" 
              : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
          level > 0 && "ml-4"
        )}
        onClick={() => onSelect(node)}
      >
        <div 
          className="flex items-center justify-center w-5 h-5 cursor-pointer"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="w-4 h-4" /> // spacing placeholder
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-1">
          {getIconForNode(node.name)}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        
        {node.employeeCount && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {node.employeeCount}
          </Badge>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="flex flex-col gap-0.5">
            {node.children!.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                onSelect={onSelect}
                selectedNodeId={selectedNodeId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function OrganizationTree({ onSelect, selectedNodeId }: OrganizationTreeProps) {
  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)] pr-4 custom-scrollbar">
      {organizationData.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          onSelect={onSelect}
          selectedNodeId={selectedNodeId}
        />
      ))}
    </div>
  );
}
