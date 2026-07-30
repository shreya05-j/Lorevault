"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  GitBranch,
  Plus,
  Users,
  Heart,
  Shield,
  Swords,
  Users2,
  Trash2,
  Edit2,
} from "lucide-react";
import {
  Character,
  CharacterRelationshipWithDetails,
  RelationshipType,
} from "@/types";

interface RelationshipGraphProps {
  characters: Character[];
  relationships: CharacterRelationshipWithDetails[];
  onAddRelationship: () => void;
  onDeleteRelationship: (id: number) => void;
}

interface NodePos {
  x: number;
  y: number;
}

export function RelationshipGraph({
  characters,
  relationships,
  onAddRelationship,
  onDeleteRelationship,
}: RelationshipGraphProps) {
  const [selectedCharId, setSelectedCharId] = useState<number | null>(null);
  const [positions, setPositions] = useState<Record<number, NodePos>>({});
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Layout characters in an oval or grid pattern around the canvas center
  useEffect(() => {
    const newPos: Record<number, NodePos> = {};
    const radiusX = 280;
    const radiusY = 190;
    const centerX = 440;
    const centerY = 280;

    characters.forEach((char, idx) => {
      const angle = (idx / Math.max(1, characters.length)) * 2 * Math.PI - Math.PI / 2;
      newPos[char.id] = {
        x: centerX + radiusX * Math.cos(angle),
        y: centerY + radiusY * Math.sin(angle),
      };
    });
    setPositions(newPos);
  }, [characters.length]);

  const getRelColor = (type: RelationshipType) => {
    switch (type) {
      case "Lovers":
        return { stroke: "#c084fc", bg: "bg-purple-950/80 text-purple-200 border-purple-500/40" };
      case "Rival":
        return { stroke: "#f43f5e", bg: "bg-rose-950/80 text-rose-200 border-rose-500/40" };
      case "Family":
        return { stroke: "#f59e0b", bg: "bg-amber-950/80 text-amber-200 border-amber-500/40" };
      case "Ally":
      default:
        return { stroke: "#10b981", bg: "bg-emerald-950/80 text-emerald-200 border-emerald-500/40" };
    }
  };

  const getRelIcon = (type: RelationshipType) => {
    switch (type) {
      case "Lovers":
        return <Heart className="w-3 h-3 text-purple-400" />;
      case "Rival":
        return <Swords className="w-3 h-3 text-rose-400" />;
      case "Family":
        return <Users2 className="w-3 h-3 text-amber-400" />;
      case "Ally":
      default:
        return <Shield className="w-3 h-3 text-emerald-400" />;
    }
  };

  const filteredRelationships = selectedCharId
    ? relationships.filter(
        (r) =>
          r.characterFromId === selectedCharId ||
          r.characterToId === selectedCharId
      )
    : relationships;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-amber-100 tracking-wide">
            Character Relationship Graph
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Visual map of self-referential many-to-many character connections
            (Rivals, Allies, Family, Lovers). Drag character nodes to arrange.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Character Highlight Filter */}
          <select
            value={selectedCharId || ""}
            onChange={(e) =>
              setSelectedCharId(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="bg-[#181b20] border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-200 font-medium focus:outline-none"
          >
            <option value="">All Relationships ({relationships.length})</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                Highlight: {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={onAddRelationship}
            disabled={characters.length < 2}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-100 rounded-lg text-xs font-semibold shadow-md transition-all disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Add Connection</span>
          </button>
        </div>
      </div>

      {/* SVG Relationship Graph & Interactive Canvas */}
      {characters.length === 0 ? (
        <div className="text-center py-16 bg-[#16191f] border border-white/10 rounded-2xl p-8">
          <GitBranch className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg text-amber-200 mb-1">
            No Characters Found
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Create characters in the Character Vault first to map relationships
            and story connections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT/TOP: Visual SVG Graph */}
          <div className="lg:col-span-2 bg-[#14171c] border border-white/10 rounded-2xl relative overflow-hidden h-[560px] shadow-2xl flex items-center justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 880 560"
              className="w-full h-full select-none"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#8e9aab" />
                </marker>
              </defs>

              {/* Render edges */}
              {filteredRelationships.map((rel) => {
                const p1 = positions[rel.characterFromId];
                const p2 = positions[rel.characterToId];
                if (!p1 || !p2) return null;

                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2 - 20;
                const color = getRelColor(rel.relationshipType);

                return (
                  <g key={rel.id} className="transition-opacity duration-300">
                    <path
                      d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                      fill="none"
                      stroke={color.stroke}
                      strokeWidth="2.5"
                      strokeDasharray={rel.relationshipType === "Rival" ? "5,5" : undefined}
                      markerEnd="url(#arrow)"
                      opacity="0.8"
                    />
                    {/* Badge at midpoint */}
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-38"
                        y="-10"
                        width="76"
                        height="20"
                        rx="10"
                        fill="#111317"
                        stroke={color.stroke}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#e9ecef"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {rel.relationshipType}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Render Character Node Circles */}
              {characters.map((char) => {
                const pos = positions[char.id] || { x: 440, y: 280 };
                const isSelected = selectedCharId === char.id;

                return (
                  <g
                    key={char.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer group"
                    onClick={() =>
                      setSelectedCharId(
                        selectedCharId === char.id ? null : char.id
                      )
                    }
                  >
                    {/* Glow ring */}
                    <circle
                      r="36"
                      fill="#181b20"
                      stroke={isSelected ? "#e09f3e" : "#2f3642"}
                      strokeWidth={isSelected ? "3" : "2"}
                      className="group-hover:stroke-amber-400 transition-all"
                    />

                    {/* Avatar inner circle */}
                    <clipPath id={`clip-${char.id}`}>
                      <circle r="30" />
                    </clipPath>
                    <image
                      href={char.avatarUrl}
                      x="-30"
                      y="-30"
                      width="60"
                      height="60"
                      clipPath={`url(#clip-${char.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Name Label */}
                    <rect
                      x="-55"
                      y="40"
                      width="110"
                      height="20"
                      rx="4"
                      fill="#111317"
                      stroke="#272c35"
                    />
                    <text
                      x="0"
                      y="54"
                      textAnchor="middle"
                      fill="#e9ecef"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="serif"
                    >
                      {char.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* RIGHT: Relationship Ledger / Details List */}
          <div className="bg-[#181b20] border border-white/10 rounded-2xl p-5 flex flex-col h-[560px]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
              <h3 className="font-serif font-semibold text-sm text-amber-100">
                Relationship Ledger
              </h3>
              <span className="text-xs text-neutral-400 font-mono">
                {filteredRelationships.length} active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredRelationships.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  No relationship links recorded yet. Click &ldquo;Add
                  Connection&rdquo; to define dynamics.
                </div>
              ) : (
                filteredRelationships.map((rel) => {
                  const style = getRelColor(rel.relationshipType);
                  return (
                    <div
                      key={rel.id}
                      className="p-3 bg-[#13161a] border border-white/5 rounded-xl space-y-2 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-amber-100">
                          <span>{rel.characterFrom?.name}</span>
                          <span className="text-neutral-500">→</span>
                          <span>{rel.characterTo?.name}</span>
                        </div>

                        <button
                          onClick={() => onDeleteRelationship(rel.id)}
                          className="p-1 text-neutral-500 hover:text-rose-400 rounded"
                          title="Delete Connection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border ${style.bg}`}
                        >
                          {getRelIcon(rel.relationshipType)}
                          <span>{rel.relationshipType}</span>
                        </span>
                      </div>

                      {rel.notes && (
                        <p className="text-xs text-neutral-300 italic pt-1 border-t border-white/5">
                          &ldquo;{rel.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
