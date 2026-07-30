"use client";

import React, { useState } from "react";
import {
  User,
  Heart,
  AlertTriangle,
  BookOpen,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Character, CharacterRole } from "@/types";

interface CharacterCardProps {
  character: Character;
  onEdit: (char: Character) => void;
  onDelete: (id: number) => void;
}

export function CharacterCard({
  character,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const getRoleBadgeStyle = (role: CharacterRole) => {
    switch (role) {
      case "Protagonist":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Antagonist":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30";
      case "Supporting":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "Minor":
      default:
        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="group relative bg-[#181b20] border border-white/10 hover:border-amber-500/30 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg">
      {/* Top Background Banner Accent */}
      <div className="h-14 bg-gradient-to-r from-[#21262d] via-[#1b1f26] to-[#181b20] border-b border-white/5 relative">
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(character)}
            title="Edit Character"
            className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-neutral-300 hover:text-amber-200 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete character "${character.name}"?`
                )
              ) {
                onDelete(character.id);
              }
            }}
            title="Delete Character"
            className="p-1.5 rounded-lg bg-black/40 hover:bg-rose-900/60 text-neutral-300 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-5 pb-4 -mt-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full border-2 border-amber-500/40 bg-[#14171c] overflow-hidden shadow-xl mb-3">
          {!imgError && character.avatarUrl ? (
            <img
              src={character.avatarUrl}
              alt={character.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1c2128] to-[#111317] text-amber-400">
              <User className="w-8 h-8" />
            </div>
          )}
        </div>

        <h3 className="font-serif text-lg font-semibold text-amber-100 tracking-wide">
          {character.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full border ${getRoleBadgeStyle(
              character.role
            )}`}
          >
            {character.role}
          </span>
          {character.age && character.age !== "Unknown" && (
            <span className="text-xs text-neutral-400 font-mono">
              Age {character.age}
            </span>
          )}
        </div>
      </div>

      {/* Core Highlights */}
      <div className="px-5 py-3 border-t border-white/5 space-y-2.5 flex-1">
        {character.internalDesire && (
          <div className="flex items-start gap-2 text-xs">
            <Heart className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-neutral-300 line-clamp-2">
              <strong className="text-amber-200 font-medium">Desire:</strong>{" "}
              {character.internalDesire}
            </span>
          </div>
        )}
        {character.flaw && (
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="text-neutral-300 line-clamp-2">
              <strong className="text-rose-200 font-medium">Flaw:</strong>{" "}
              {character.flaw}
            </span>
          </div>
        )}
        {character.physicalDescription && !isExpanded && (
          <p className="text-xs text-neutral-400 line-clamp-2 italic pt-1 border-t border-white/5">
            &ldquo;{character.physicalDescription}&rdquo;
          </p>
        )}
      </div>

      {/* Expandable Deep Backstory & Notes */}
      {isExpanded && (
        <div className="px-5 py-3 bg-[#13161a] border-t border-white/5 space-y-3 text-xs animate-in fade-in duration-200">
          {character.physicalDescription && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mb-1">
                Physical Appearance
              </h4>
              <p className="text-neutral-300 leading-relaxed">
                {character.physicalDescription}
              </p>
            </div>
          )}
          {character.backstory && (
            <div>
              <h4 className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mb-1">
                Backstory & Secrets
              </h4>
              <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {character.backstory}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Card Footer Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-2 px-4 bg-[#14171c]/80 hover:bg-[#1f242d] border-t border-white/5 flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-amber-200 transition-colors"
      >
        <span>
          {isExpanded ? "Hide Deep Profile" : "Expand Backstory & Details"}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
