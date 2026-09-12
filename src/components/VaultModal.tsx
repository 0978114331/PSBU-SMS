import { useState } from 'react';
import { X, Archive, Link as LinkIcon, FileText, StickyNote, ExternalLink, Download, Lock, Globe, File, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/lib/app-context';

type Props = {
  open: boolean;
  onClose: () => void;
  notes: any[];
  isAdmin: boolean;
};

export function VaultModal({ open, onClose, notes, isAdmin }: Props) {
  const { t } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!open) return null;

  const visibleNotes = isAdmin ? notes : notes.filter(n => n.is_private === false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'link': return <LinkIcon size={20} style={{ color: '#3b82f6' }} />;
      case 'document': return <FileText size={20} style={{ color: '#10b981' }} />;
      default: return <StickyNote size={20} style={{ color: '#f59e0b' }} />;
    }
  };

  const handleCopy = (text: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[900px] h-[95vh] sm:h-[85vh] rounded-2xl relative flex flex-col shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
              <Archive size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold line-clamp-1" style={{ color: 'var(--text-main)' }}>
                {t('My Vault', 'ឃ្លាំងឯកសារផ្ទាល់ខ្លួន')}
              </h3>
              <p className="text-[10px] sm:text-xs font-semibold mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                {isAdmin ? 'Admin View: Showing all private and public files.' : 'Public View: Showing shared resources.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors flex-shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ background: 'var(--bg-base)' }}>
          {visibleNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Archive size={64} className="mb-4" />
              <p className="font-semibold text-lg">{t('Vault is empty.', 'មិនទាន់មានឯកសារនៅឡើយទេ។')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {visibleNotes.map((note) => {
                const isExpanded = expandedId === note.id;
                
                const fileList = note.files && note.files.length > 0 ? note.files : (note.content_url && note.type === 'document' ? [{ name: note.file_name || 'Document', url: note.content_url }] : []);
                const linkList = note.links && note.links.length > 0 ? note.links : (note.content_url && note.type === 'link' ? [{ name: 'Link Website', url: note.content_url }] : []);

                const hasLongText = note.description && note.description.length > 100;
                const hasManyFiles = fileList.length > 1;
                const hasManyLinks = linkList.length > 1;
                const needsExpansion = hasLongText || hasManyFiles || hasManyLinks;

                const visibleFiles = isExpanded ? fileList : fileList.slice(0, 1);
                const visibleLinks = isExpanded ? linkList : linkList.slice(0, 1);

                return (
                  <div key={note.id} className="p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-xl flex flex-col h-full" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderTop: `4px solid ${note.type === 'document' ? '#10b981' : note.type === 'link' ? '#3b82f6' : '#f59e0b'}` }}>
                    
                    <div className="flex items-start justify-between mb-4 flex-shrink-0">
                      <div className="flex items-center gap-3 font-bold text-sm sm:text-base w-full pr-2" style={{ color: 'var(--text-main)' }}>
                        <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 flex-shrink-0">
                          {getIcon(note.type)}
                        </div>
                        <span className="line-clamp-2 flex-1">{note.title}</span>
                        
                        {note.type === 'note' && note.description && (
                          <button 
                            onClick={(e) => handleCopy(note.description, `note-${note.id}`, e)}
                            className="p-1.5 flex-shrink-0 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                            title="Copy Note Content"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {copiedId === `note-${note.id}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        )}
                        
                      </div>
                      {isAdmin && (
                        <div title={note.is_private ? 'Private' : 'Public'} className="flex-shrink-0 ml-2 mt-2">
                          {note.is_private ? <Lock size={16} style={{ color: '#ef4444' }} /> : <Globe size={16} style={{ color: '#10b981' }} />}
                        </div>
                      )}
                    </div>
                    
                    {note.description && (
                      <div className="mb-4">
                        <p className={`text-sm leading-relaxed select-text whitespace-pre-wrap ${!isExpanded ? 'line-clamp-3' : ''}`} style={{ color: 'var(--text-muted)' }}>
                          {note.description}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto flex flex-col gap-4">
                      {note.type === 'document' && fileList.length > 0 && (
                        <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                          {visibleFiles.map((f: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-3">
                              <div className="flex items-center gap-2 p-3 rounded-lg border text-xs sm:text-sm font-semibold" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-color)' }}>
                                <File size={16} style={{ color: '#10b981' }} className="flex-shrink-0" />
                                <span className="truncate flex-1 select-text" style={{ color: 'var(--text-main)' }}>{f.name}</span>
                              </div>
                              <div className="flex gap-2 sm:gap-3">
                                <a
                                  href={f.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-white"
                                  style={{ background: '#10b981' }}
                                >
                                  <ExternalLink size={16} /> {t('Open', 'បើកមើល')}
                                </a>
                                <a
                                  href={`${f.url}?download=`}
                                  download={f.name}
                                  className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all border shadow-sm hover:shadow-md"
                                  style={{ background: 'transparent', borderColor: '#10b981', color: '#10b981' }}
                                >
                                  <Download size={16} /> {t('Download', 'ទាញយក')}
                                </a>
                              </div>
                            </div>
                          ))}
                          {!isExpanded && hasManyFiles && (
                            <div className="text-xs text-center font-semibold italic mt-1" style={{ color: 'var(--text-muted)' }}>
                              + {fileList.length - 1} ឯកសារទៀត
                            </div>
                          )}
                        </div>
                      )}

                      {note.type === 'link' && linkList.length > 0 && (
                        <div className="flex flex-col gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                          {visibleLinks.map((l: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-3">
                              <div className="flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm" style={{ background: 'var(--bg-base)', borderColor: 'var(--border-color)' }}>
                                <span className="truncate flex-1 select-text font-semibold" style={{ color: 'var(--text-muted)' }}>{l.url}</span>
                                <button 
                                  onClick={(e) => handleCopy(l.url, `link-${note.id}-${idx}`, e)}
                                  className="ml-2 p-1.5 flex-shrink-0 rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                                  title="Copy Link"
                                  style={{ color: 'var(--text-main)' }}
                                >
                                  {copiedId === `link-${note.id}-${idx}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                              </div>
                              <a
                                href={l.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-white"
                                style={{ background: '#3b82f6' }}
                              >
                                <ExternalLink size={16} /> {t('Open Link', 'បើកតំណភ្ជាប់')}
                              </a>
                            </div>
                          ))}
                          {!isExpanded && hasManyLinks && (
                            <div className="text-xs text-center font-semibold italic mt-1" style={{ color: 'var(--text-muted)' }}>
                              + {linkList.length - 1} តំណភ្ជាប់ទៀត
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {needsExpansion && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(isExpanded ? null : note.id);
                        }}
                        className="w-full mt-5 pt-3 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest border-t transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--primary)' }}
                      >
                        {isExpanded ? (
                          <><ChevronUp size={16} /> {t('Show Less', 'បង្រួមវិញ')}</>
                        ) : (
                          <><ChevronDown size={16} /> {t('See All', 'មើលទាំងអស់')}</>
                        )}
                      </button>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}