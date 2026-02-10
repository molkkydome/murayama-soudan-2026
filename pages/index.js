import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'おめでとうございます。\n昨日あっためでたいことを無理やり1つ教えてください！\n\nあと、差支えない範囲で最近のあなたの脳内教えてください。'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
            .filter(m => m.role !== 'assistant' || messages.indexOf(m) !== 0)
            .concat(userMessage)
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        const assistantMessage = {
          role: 'assistant',
          content: data.content[0].text
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'あー、ちょっと通信がうまくいかなかったっすね。もう一回言ってもらえます？'
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'あー、ちょっと通信がうまくいかなかったっすね。もう一回言ってもらえます？'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Head>
        <title>マルタ村相談室</title>
        <meta name="description" content="完結しない村の哲学を体現した相談室" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>村山相談室</h1>
        </div>

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...styles.messageWrapper,
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  ...(message.role === 'user' ? styles.userBubble : styles.assistantBubble)
                }}
              >
                <p style={styles.messageText}>{message.content}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={styles.messageWrapper}>
              <div style={styles.assistantBubble}>
                <div style={styles.loadingDots}>
                  <div style={styles.dot}></div>
                  <div style={{...styles.dot, animationDelay: '0.2s'}}></div>
                  <div style={{...styles.dot, animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <div style={styles.inputWrapper}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="何か気になってることとか、話したいことあります？"
              style={styles.textarea}
              rows="2"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              style={{
                ...styles.button,
                ...(isLoading || !input.trim() ? styles.buttonDisabled : {})
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <p style={styles.hint}>
            Enterで送信 / Shift+Enterで改行
          </p>
        </div>

        <style jsx>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
          }
        `}</style>
      </div>
    </>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'linear-gradient(to bottom right, #fffbeb, #ffedd5, #fef3c7)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderBottom: '1px solid #fcd34d',
    padding: '1rem 1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#78350f',
    margin: 0,
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 1rem',
  },
  messageWrapper: {
    display: 'flex',
    marginBottom: '1rem',
  },
  messageBubble: {
    maxWidth: '600px',
    padding: '0.75rem 1rem',
    borderRadius: '1rem',
    lineHeight: '1.5',
  },
  userBubble: {
    backgroundColor: '#d97706',
    color: 'white',
  },
  assistantBubble: {
    backgroundColor: 'white',
    color: '#1f2937',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #fde68a',
  },
  messageText: {
    whiteSpace: 'pre-wrap',
    margin: 0,
  },
  loadingDots: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#d97706',
    borderRadius: '50%',
    animation: 'bounce 1.4s infinite ease-in-out',
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    borderTop: '1px solid #fcd34d',
    padding: '1rem',
  },
  inputWrapper: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'flex',
    gap: '0.5rem',
  },
  textarea: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #fcd34d',
    borderRadius: '1rem',
    fontSize: '1rem',
    resize: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    outline: 'none',
    fontFamily: 'inherit',
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#d97706',
    color: 'white',
    border: 'none',
    borderRadius: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
    cursor: 'not-allowed',
  },
  hint: {
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#d97706',
    marginTop: '0.5rem',
  },
};
