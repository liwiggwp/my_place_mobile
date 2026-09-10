import React, { useState } from 'react';
import type { NotionPage, NotionBlock, BlockType } from '../../types/notion';
import {
  Plus,
  Trash2,
  Sparkles,
  Check,
  Pin
} from 'lucide-react';
import { AddBlockModal } from './AddBlockModal';

interface PageEditorViewProps {
  page: NotionPage;
  appData?: any;
  onUpdatePage: (updated: NotionPage) => void;
  onDeletePage?: (id: string) => void;
  onNavigateBuiltin?: (tab: string) => void;
  onBack?: () => void;
}

const EMOJI_LIST = ['📝', '💡', '✈️', '🚀', '📚', '🎯', '🌿', '🎨', '💼', '🏡', '⭐️', '🌸', '☕️', '🍕', '💻'];

export const PageEditorView: React.FC<PageEditorViewProps> = ({
  page,
  onUpdatePage,
  onDeletePage,
  onNavigateBuiltin
}) => {
  const [title, setTitle] = useState(page.title);
  const [icon, setIcon] = useState(page.icon || '📝');
  const [isPinned, setIsPinned] = useState(page.isPinned || false);
  const [blocks, setBlocks] = useState<NotionBlock[]>(page.blocks || []);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isAddBlockOpen, setIsAddBlockOpen] = useState(false);

  // Sync state up to parent
  const handleSavePage = (newBlocks: NotionBlock[], newTitle = title, newIcon = icon, newPinned = isPinned) => {
    onUpdatePage({
      ...page,
      title: newTitle,
      icon: newIcon,
      isPinned: newPinned,
      blocks: newBlocks,
      updatedAt: new Date().toISOString()
    });
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    handleSavePage(blocks, val, icon, isPinned);
  };

  const handleSelectIcon = (emoji: string) => {
    setIcon(emoji);
    setIsEmojiPickerOpen(false);
    handleSavePage(blocks, title, emoji, isPinned);
  };

  const handleTogglePin = () => {
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    handleSavePage(blocks, title, icon, nextPin);
  };

  const handleAddBlock = (type: BlockType, extra?: { icon?: string; color?: string; widgetType?: string }) => {
    const newBlock: NotionBlock = {
      id: `blk-${Date.now()}`,
      type,
      content: '',
      checked: false,
      icon: extra?.icon || (type === 'callout' ? '💡' : undefined),
      color: extra?.color || (type === 'callout' ? 'indigo' : undefined),
      widgetType: extra?.widgetType as any,
      createdAt: new Date().toISOString()
    };
    const nextBlocks = [...blocks, newBlock];
    setBlocks(nextBlocks);
    handleSavePage(nextBlocks);
  };

  const handleUpdateBlockContent = (id: string, content: string) => {
    const nextBlocks = blocks.map(b => (b.id === id ? { ...b, content } : b));
    setBlocks(nextBlocks);
    handleSavePage(nextBlocks);
  };

  const handleToggleTodo = (id: string) => {
    const nextBlocks = blocks.map(b => (b.id === id ? { ...b, checked: !b.checked } : b));
    setBlocks(nextBlocks);
    handleSavePage(nextBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    const nextBlocks = blocks.filter(b => b.id !== id);
    setBlocks(nextBlocks);
    handleSavePage(nextBlocks);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-slate-800">
      
      {/* Page Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          {/* Icon / Emoji button */}
          <div className="relative">
            <button
              onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
              className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              {icon}
            </button>

            {/* Emoji Picker Dropdown */}
            {isEmojiPickerOpen && (
              <div className="absolute left-0 top-14 z-30 p-2 rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-wrap gap-1.5 w-60 animate-fade-in">
                {EMOJI_LIST.map(e => (
                  <button
                    key={e}
                    onClick={() => handleSelectIcon(e)}
                    className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-xl cursor-pointer"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePin}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isPinned
                  ? 'bg-amber-100 text-amber-800 font-bold'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
              }`}
              title={isPinned ? 'Закреплено' : 'Закрепить'}
            >
              <Pin className="w-4.5 h-4.5" />
            </button>

            {onDeletePage && (
              <button
                onClick={() => {
                  if (confirm(`Удалить страницу "${title}"?`)) {
                    onDeletePage(page.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Удалить страницу"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Название страницы..."
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            className="w-full text-2xl sm:text-3xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Blocks Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 min-h-[300px]">
        {blocks.length === 0 ? (
          <div
            onClick={() => setIsAddBlockOpen(true)}
            className="p-10 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-xs cursor-pointer hover:bg-slate-50 transition-colors space-y-2"
          >
            <Sparkles className="w-6 h-6 mx-auto text-indigo-400" />
            <p className="font-bold text-slate-600">Страница пуста</p>
            <p>Нажмите, чтобы добавить заголовки, чеклисты, заметки или виджеты</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map(block => (
              <div key={block.id} className="group relative flex items-start gap-2">
                
                {/* 1. HEADING 1 */}
                {block.type === 'heading1' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                    placeholder="Заголовок 1..."
                    className="w-full text-xl font-black text-slate-900 focus:outline-hidden pt-2"
                  />
                )}

                {/* 2. HEADING 2 */}
                {block.type === 'heading2' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                    placeholder="Заголовок 2..."
                    className="w-full text-lg font-extrabold text-slate-800 focus:outline-hidden pt-1"
                  />
                )}

                {/* 3. HEADING 3 */}
                {block.type === 'heading3' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                    placeholder="Заголовок 3..."
                    className="w-full text-base font-bold text-slate-700 focus:outline-hidden"
                  />
                )}

                {/* 4. TEXT */}
                {block.type === 'text' && (
                  <textarea
                    rows={2}
                    value={block.content}
                    onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                    placeholder="Введите текст или заметку..."
                    className="w-full text-xs font-normal text-slate-700 focus:outline-hidden resize-none leading-relaxed"
                  />
                )}

                {/* 5. TODO CHECKLIST */}
                {block.type === 'todo' && (
                  <div className="flex items-center gap-2.5 w-full">
                    <button
                      type="button"
                      onClick={() => handleToggleTodo(block.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
                        block.checked ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300'
                      }`}
                    >
                      {block.checked && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <input
                      type="text"
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                      placeholder="Задача..."
                      className={`w-full text-xs font-semibold focus:outline-hidden ${
                        block.checked ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    />
                  </div>
                )}

                {/* 6. CALLOUT */}
                {block.type === 'callout' && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5 w-full">
                    <span className="text-lg shrink-0">{block.icon || '💡'}</span>
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                      placeholder="Важная мысль или цитата..."
                      className="w-full text-xs font-semibold text-indigo-950 bg-transparent focus:outline-hidden resize-none"
                    />
                  </div>
                )}

                {/* 7. BULLET */}
                {block.type === 'bullet' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                      placeholder="Пункт списка..."
                      className="w-full text-xs font-medium text-slate-700 focus:outline-hidden"
                    />
                  </div>
                )}

                {/* 8. NUMBERED */}
                {block.type === 'numbered' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">1.</span>
                    <input
                      type="text"
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                      placeholder="Нумерованный пункт..."
                      className="w-full text-xs font-medium text-slate-700 focus:outline-hidden"
                    />
                  </div>
                )}

                {/* 9. QUOTE */}
                {block.type === 'quote' && (
                  <div className="pl-3.5 border-l-2 border-purple-400 w-full italic text-xs text-purple-900 py-0.5">
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={e => handleUpdateBlockContent(block.id, e.target.value)}
                      placeholder="Цитата..."
                      className="w-full bg-transparent focus:outline-hidden italic resize-none"
                    />
                  </div>
                )}

                {/* 10. DIVIDER */}
                {block.type === 'divider' && (
                  <hr className="w-full my-3 border-slate-200" />
                )}

                {/* 11. EMBED WIDGET */}
                {block.type === 'embed_widget' && (
                  <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-base shadow-2xs">
                        {block.widgetType === 'finance' && '💳'}
                        {block.widgetType === 'tasks' && '✅'}
                        {block.widgetType === 'water' && '💧'}
                        {block.widgetType === 'pills' && '💊'}
                        {block.widgetType === 'cycle' && '🌸'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Встроенный хаб: {block.widgetType}
                        </span>
                        <span className="text-[10px] text-slate-400">Нажмите, чтобы открыть раздел</span>
                      </div>
                    </div>

                    {onNavigateBuiltin && (
                      <button
                        type="button"
                        onClick={() => onNavigateBuiltin(block.widgetType || 'tasks')}
                        className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Перейти →
                      </button>
                    )}
                  </div>
                )}

                {/* Delete block button */}
                <button
                  type="button"
                  onClick={() => handleDeleteBlock(block.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-opacity cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Block Bottom Button */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setIsAddBlockOpen(true)}
            className="py-2.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить блок</span>
          </button>
        </div>
      </div>

      <AddBlockModal
        isOpen={isAddBlockOpen}
        onClose={() => setIsAddBlockOpen(false)}
        onSelectBlockType={handleAddBlock}
      />
    </div>
  );
};
