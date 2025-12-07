import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const EMOJI_CATEGORIES = {
  fitness: ['💪', '🏋️', '🏃', '🧘', '🥊', '🏊', '🚴', '⚡', '🔥', '💯'],
  emotions: ['❤️', '😊', '🙌', '👏', '🎯', '⭐', '✨', '🌟', '💫', '🎉'],
  nature: ['🌱', '🌿', '🍃', '🌺', '🦋', '🌈', '☀️', '🌙', '💧', '🌊'],
  gestures: ['👊', '✊', '🤝', '👍', '💎', '🏆', '🥇', '🎖️', '📈', '🚀'],
  objects: ['📋', '📊', '🎓', '💡', '🔑', '⏱️', '📅', '💬', '🎧', '🧠'],
};

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ value, onChange, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [customEmoji, setCustomEmoji] = useState('');

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    if (customEmoji.trim()) {
      onChange(customEmoji.trim());
      setCustomEmoji('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", className)}
        >
          <span className="text-2xl mr-2">{value || '😀'}</span>
          <span className="text-muted-foreground">
            {value ? 'Change emoji' : 'Select emoji'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3 bg-popover" align="start">
        <div className="space-y-3">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category}>
              <p className="text-xs font-medium text-muted-foreground capitalize mb-1.5">
                {category}
              </p>
              <div className="flex flex-wrap gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center text-xl rounded hover:bg-accent transition-colors",
                      value === emoji && "bg-accent ring-2 ring-primary"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Custom emoji
            </p>
            <div className="flex gap-2">
              <Input
                value={customEmoji}
                onChange={(e) => setCustomEmoji(e.target.value)}
                placeholder="Paste any emoji"
                className="flex-1"
              />
              <Button size="sm" onClick={handleCustomSubmit} disabled={!customEmoji.trim()}>
                Use
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
