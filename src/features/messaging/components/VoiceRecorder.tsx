import { useRef, useState } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob) => void;
}

function getSupportedMimeType(): string {
  const candidates = ['audio/mp4', 'audio/webm', 'audio/ogg'];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef('');

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/mp4',
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.onerror = () => {
        setErrorMessage('Recording failed. Please try again.');
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setErrorMessage(
        'Could not access your microphone. Please check your browser/app permissions and try again.'
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const cancelRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setErrorMessage(null);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob);
      cancelRecording();
    }
  };

  if (errorMessage) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-caption text-destructive">{errorMessage}</span>
        <Button size="sm" variant="ghost" onClick={() => setErrorMessage(null)} className="w-fit">
          Dismiss
        </Button>
      </div>
    );
  }

  if (audioUrl) {
    return (
      <div className="flex items-center gap-2">
        <audio controls src={audioUrl}>
          <track kind="captions" />
        </audio>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={cancelRecording}
          title="Cancel recording"
        >
          <X className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="default"
          size="icon"
          onClick={handleSend}
          title="Send voice note"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      size="icon"
      className="shrink-0 self-end"
      onClick={isRecording ? stopRecording : startRecording}
      title={isRecording ? 'Stop recording' : 'Record a voice note'}
    >
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
