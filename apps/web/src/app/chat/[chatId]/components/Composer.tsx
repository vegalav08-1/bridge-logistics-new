'use client';
import { useEffect, useRef, useState } from 'react';
import { Paperclip, Send, Plus, Image as ImageIcon, FileText, WifiOff } from 'lucide-react';
import { useOutboxProcessor, queueFile, queueText } from '@/lib/outbox/useOutbox';
import { useNetwork } from '@/lib/outbox/useNetwork';
import { emitLocalFile, emitLocalText } from '@/lib/chat/bus';
import { useRealtime } from '@/lib/realtime/context';
import { REALTIME_V2_ENABLED } from '@/lib/flags';
import MentionAutocomplete from './MentionAutocomplete';
import { isAtMentionPosition, getMentionQuery, replaceMention, extractMentions } from '@/lib/mentions/utils';
import type { MentionUser } from '@/lib/mentions/utils';
import { FileAttachment } from './FileAttachment';

type Props = {
  chatId: string;
  maxLen?: number;     // ограничение длины текста (например, 4000)
  onSendMessage?: (content: string, attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }>) => void;
};

export default function Composer({ chatId, maxLen = 4000, onSendMessage }: Props) {
  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [counter, setCounter] = useState(0);
  const [selectedFileType, setSelectedFileType] = useState<string>('');
  const [uploadingFiles, setUploadingFiles] = useState<Array<{
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    url?: string;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { process } = useOutboxProcessor();
  const online = useNetwork();
  const { send } = useRealtime();
  const typingTimerRef = useRef<any>(null);

  // Mentions state
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mock users for mentions (в реальном приложении загружаем из API)
  const mentionUsers: MentionUser[] = [
    { id: 'user1', name: 'Иван Петров', avatar: undefined },
    { id: 'user2', name: 'Мария Сидорова', avatar: undefined },
    { id: 'user3', name: 'Алексей Козлов', avatar: undefined },
    { id: 'admin1', name: 'Администратор', avatar: undefined },
  ];

  useEffect(() => { setCounter(text.length); }, [text]);

  // Typing индикация и обработка mentions
  const handleTyping = (value: string) => {
    setText(value);
    if (REALTIME_V2_ENABLED) {
      send({ type: 'typing', data: { chatId, isTyping: true } });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        send({ type: 'typing', data: { chatId, isTyping: false } });
      }, 1500);
    }
  };

  // Обработка изменений в textarea с поддержкой mentions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setText(value);
    setCursorPosition(cursorPos);
    
    // Проверяем, находимся ли в позиции упоминания
    if (isAtMentionPosition(value, cursorPos)) {
      const query = getMentionQuery(value, cursorPos);
      setMentionQuery(query);
      
      // Показываем автокомплит если есть запрос
      if (query.length > 0) {
        setShowMentions(true);
        updateMentionPosition();
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
    
    // Typing индикация
    if (REALTIME_V2_ENABLED) {
      send({ type: 'typing', data: { chatId, isTyping: true } });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        send({ type: 'typing', data: { chatId, isTyping: false } });
      }, 1500);
    }
  };

  // Обновление позиции автокомплита
  const updateMentionPosition = () => {
    if (textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      setMentionPosition({
        top: rect.top - 200, // показываем выше textarea
        left: rect.left
      });
    }
  };

  // Выбор пользователя из автокомплита
  const handleMentionSelect = (user: MentionUser) => {
    const { newText, newCursorPosition } = replaceMention(
      text, 
      cursorPosition, 
      mentionQuery, 
      user.name
    );
    
    setText(newText);
    setShowMentions(false);
    
    // Устанавливаем курсор после вставки
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };

  // Закрытие автокомплита
  const handleMentionClose = () => {
    setShowMentions(false);
  };

  const sendText = async () => {
    const t = text.trim();
    if (!t && uploadingFiles.length === 0) return;
    
    // Извлекаем mentions из текста
    const mentions = extractMentions(t);
    console.log('Mentions found:', mentions);
    
    // Подготавливаем файлы для отправки
    const attachments = uploadingFiles
      .filter(file => file.status === 'completed' && file.file)
      .map(file => ({
        id: file.id,
        name: file.file.name,
        size: file.file.size,
        type: file.file.type,
        url: file.url || '#'
      }));

    // Отправляем текст и файлы
    if (onSendMessage) {
      console.log('Composer: calling onSendMessage with text:', t, 'and attachments:', attachments);
      onSendMessage(t, attachments);
    } else {
      // Используем старую систему outbox
      if (t) {
        const tempId = await queueText(chatId, t);
        console.log('Composer: emitting local-text event', { chatId, tempId, text: t });
        emitLocalText({ chatId, tempId, text: t, createdAtISO: new Date().toISOString() });
        process(); // пробуем отправить сразу, если онлайн
      }
      
      // Отправляем прикрепленные файлы
      uploadingFiles.forEach(async (uploadingFile) => {
        if (uploadingFile.status === 'completed' && uploadingFile.file) {
          try {
            const tempId = await queueFile(chatId, uploadingFile.file);
            emitLocalFile({ chatId, tempId, file: uploadingFile.file, createdAtISO: new Date().toISOString() });
            process();
          } catch (error) {
            console.error('Ошибка отправки файла:', error);
          }
        }
      });
    }
    
    // Очищаем состояние
    setText('');
    setShowMentions(false); // закрываем автокомплит
    setUploadingFiles([]);
  };

  const pickFile = (fileType: string) => {
    setSelectedFileType(fileType);
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const getFileAcceptAttribute = (fileType: string): string => {
    switch (fileType) {
      case 'photo':
        return 'image/*';
      case 'document':
        return 'application/pdf,.pdf,.doc,.docx,.txt,.rtf';
      case 'table':
        return '.xls,.xlsx,.csv';
      case 'video':
        return 'video/*';
      default:
        return '*/*';
    }
  };

  const onFile = async (f: File) => {
    if (!f) return;
    
    console.log('Загрузка файла:', f.name, f.size, f.type);
    
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Добавляем файл в состояние загрузки
    setUploadingFiles(prev => [...prev, {
      id: fileId,
      file: f,
      progress: 0,
      status: 'uploading'
    }]);

    try {
      // Симуляция загрузки файла с прогрессом
      const uploadPromise = new Promise<string>((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            // Создаем URL для файла (в реальном приложении это будет URL с сервера)
            const url = URL.createObjectURL(f);
            resolve(url);
          }
          
          setUploadingFiles(prev => prev.map(file => 
            file.id === fileId 
              ? { ...file, progress: Math.min(progress, 100) }
              : file
          ));
        }, 100);
      });

      const fileUrl = await uploadPromise;
      
      // Обновляем статус на завершенный - файл готов к отправке
      setUploadingFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'completed', url: fileUrl, progress: 100 }
          : file
      ));

      // НЕ отправляем файл автоматически - ждем подтверждения пользователя

    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      setUploadingFiles(prev => prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'error' }
          : file
      ));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (counter > maxLen) return;
    sendText();
  };

  return (
    <div className="border-t bg-white px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
      {/* офлайн индикатор */}
      {!online && (
        <div className="mb-2 text-[12px] text-amber-600 inline-flex items-center gap-1">
          <WifiOff className="h-4 w-4" /> Вы офлайн. Сообщение уйдёт при подключении.
        </div>
      )}

           {/* Прогресс загрузки файлов */}
           {uploadingFiles.length > 0 && (
             <div className="mb-2">
               <div className="text-xs text-gray-600 mb-2">
                 Загружается файлов: {uploadingFiles.length}/10
               </div>
               <div className="space-y-2">
                 {uploadingFiles.map((uploadingFile) => (
                 <FileAttachment
                   key={uploadingFile.id}
                   file={{
                     id: uploadingFile.id,
                     name: uploadingFile.file.name,
                     size: uploadingFile.file.size,
                     type: uploadingFile.file.type,
                     url: uploadingFile.url || '#'
                   }}
                   isUploaded={false} // Файлы в процессе загрузки не показывают кнопку скачивания
                   onView={() => {}} // Просмотр недоступен для загружающихся файлов
                   progress={uploadingFile.progress}
                   status={uploadingFile.status}
                 />
               ))}
               </div>
             </div>
           )}

      <form onSubmit={onSubmit} className="flex items-end gap-2">
        {/* Кнопка "+" (меню вложений) */}
        <div className="relative">
          <button
            data-testid="composer-plus"
            type="button"
            className="h-11 w-11 rounded-xl border grid place-items-center"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
            title="Добавить"
          >
            <Plus className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div ref={menuRef} className="absolute bottom-12 left-0 w-48 rounded-xl border bg-white shadow-lg p-2 z-10">
                   <button type="button" className="w-full h-12 px-3 rounded-lg hover:bg-blue-50 flex items-center gap-3" onClick={() => pickFile('photo')}>
                     <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                       <ImageIcon className="h-5 w-5 text-blue-600" />
                     </div>
                     <span className="text-sm font-medium">Фото</span>
                   </button>
              <button type="button" className="w-full h-12 px-3 rounded-lg hover:bg-red-50 flex items-center gap-3" onClick={() => pickFile('document')}>
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-sm font-medium">Файл/PDF</span>
              </button>
              <button type="button" className="w-full h-12 px-3 rounded-lg hover:bg-green-50 flex items-center gap-3" onClick={() => pickFile('table')}>
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Таблица</span>
              </button>
              <button type="button" className="w-full h-12 px-3 rounded-lg hover:bg-purple-50 flex items-center gap-3" onClick={() => pickFile('video')}>
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Видео</span>
              </button>
            </div>
          )}
        </div>

        {/* Скрытый input для файлов */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={getFileAcceptAttribute(selectedFileType)}
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files || []);
            e.currentTarget.value = '';
            if (files.length > 0) {
              // Ограничиваем до 10 файлов
              const limitedFiles = files.slice(0, 10);
              limitedFiles.forEach(f => onFile(f));
              
              // Показываем предупреждение если файлов больше 10
              if (files.length > 10) {
                alert(`Можно загрузить максимум 10 файлов. Загружено ${limitedFiles.length} из ${files.length} файлов.`);
              }
            }
          }}
        />

        {/* Поле текста */}
        <div className="flex-1 min-w-0 relative">
          <div className="rounded-2xl border px-3 py-2 bg-white focus-within:ring-2 ring-[var(--brand)]">
            <textarea
              ref={textareaRef}
              data-testid="composer-input"
              value={text}
              onChange={handleTextareaChange}
              placeholder="Сообщение… (используйте @ для упоминаний)"
              rows={1}
              className="w-full resize-none outline-none max-h-40 text-[15px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e as any);
                }
                // Закрываем автокомплит при Escape
                if (e.key === 'Escape' && showMentions) {
                  e.preventDefault();
                  setShowMentions(false);
                }
              }}
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <div className="inline-flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" /> Поддержка до 10 файлов
              </div>
              <div className={counter > maxLen ? 'text-red-600' : ''}>
                {counter}/{maxLen}
              </div>
            </div>
          </div>
        </div>

        {/* Отправка */}
        <button
          data-testid="composer-send"
          type="submit"
          className="h-11 w-11 rounded-xl bg-[var(--brand)] text-white grid place-items-center disabled:opacity-50"
          disabled={(!text.trim() && uploadingFiles.length === 0) || counter > maxLen || uploadingFiles.some(file => file.status === 'uploading')}
          title="Отправить"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {/* Автокомплит для mentions */}
      {showMentions && (
        <MentionAutocomplete
          query={mentionQuery}
          position={mentionPosition}
          onSelect={handleMentionSelect}
          onClose={handleMentionClose}
          users={mentionUsers}
        />
      )}
    </div>
  );
}
