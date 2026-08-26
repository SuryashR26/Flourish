import React from 'react';

interface ConversationLoadingScreenProps {
  participantName?: string;
}

export default function ConversationLoadingScreen({ participantName }: ConversationLoadingScreenProps) {
  return (
    <div className="conversation-loading-screen">
      <div className="loading-content">
        <div className="loading-avatar">
          <div className="loading-avatar-skeleton"></div>
        </div>
        <div className="loading-info">
          <div className="loading-name">
            {participantName ? `Loading conversation with ${participantName}...` : 'Loading conversation...'}
          </div>
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>

      <div className="loading-messages">
        <div className="loading-message-skeleton">
          <div className="loading-message-avatar"></div>
          <div className="loading-message-bubble"></div>
        </div>
        <div className="loading-message-skeleton sent">
          <div className="loading-message-avatar"></div>
          <div className="loading-message-bubble"></div>
        </div>
        <div className="loading-message-skeleton">
          <div className="loading-message-avatar"></div>
          <div className="loading-message-bubble"></div>
        </div>
      </div>

      <style jsx>{`
        .conversation-loading-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #14171c;
          position: relative;
          overflow: hidden;
        }

        .loading-content {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          background-color: #14171c;
        }

        .loading-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
        }

        .loading-avatar-skeleton {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, #f4f5f7 25%, #e5e7eb 50%, #f4f5f7 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 50%;
        }

        .loading-info {
          flex: 1;
        }

        .loading-name {
          font-size: 1.3rem;
          font-weight: 500;
          color: #14171c;
          margin-bottom: 8px;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(31, 152, 244, 0.3);
          border-top: 2px solid #1f98f4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-messages {
          flex: 1;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background-color: #14171c;
        }

        .loading-message-skeleton {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          opacity: 0;
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .loading-message-skeleton:nth-child(1) {
          animation-delay: 0.1s;
        }

        .loading-message-skeleton:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-message-skeleton:nth-child(3) {
          animation-delay: 0.3s;
        }

        .loading-message-skeleton.sent {
          flex-direction: row-reverse;
        }

        .loading-message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f4f5f7 25%, #e5e7eb 50%, #f4f5f7 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .loading-message-bubble {
          max-width: 65%;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f4f5f7 25%, #e5e7eb 50%, #f4f5f7 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .loading-message-skeleton:nth-child(1) .loading-message-bubble {
          width: 200px;
        }

        .loading-message-skeleton:nth-child(2) .loading-message-bubble {
          width: 150px;
        }

        .loading-message-skeleton:nth-child(3) .loading-message-bubble {
          width: 250px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .conversation-loading-screen::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(31, 152, 244, 0.05) 0%,
            transparent 50%,
            rgba(31, 152, 244, 0.02) 100%
          );
          pointer-events: none;
        }
      `}</style>
    </div>
  );
} 