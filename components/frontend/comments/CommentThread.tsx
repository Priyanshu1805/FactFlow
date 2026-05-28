import { useState } from "react"
import { CommentItem } from "./CommentItem"
import { CommentInput } from "./CommentInput"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CommentThreadProps {
  articleId: string
  comment: any
  replies: any[]
  onHide: (id: string) => void
  onDelete: (id: string) => void
  onReplyAdded: (reply: any) => void
}

export function CommentThread({ articleId, comment, replies, onHide, onDelete, onReplyAdded }: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)

  return (
    <div className="mb-6">
      {/* Top Level Comment */}
      <CommentItem 
        comment={comment} 
        onReplyClick={() => setShowReplyInput(!showReplyInput)}
        onHide={onHide}
        onDelete={onDelete}
      />

      {/* Input for Top Level Reply */}
      {showReplyInput && (
        <div className="ml-14 mt-4">
          <CommentInput 
            articleId={articleId} 
            parentId={comment._id} 
            autoFocus 
            onCancel={() => setShowReplyInput(false)}
            onCommentAdded={(reply) => {
              setShowReplyInput(false)
              setShowReplies(true)
              onReplyAdded(reply)
            }}
          />
        </div>
      )}

      {/* Replies Toggle */}
      {replies.length > 0 && (
        <div className="ml-14 mt-2">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-full transition-colors"
          >
            {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </button>
        </div>
      )}

      {/* Replies List */}
      {showReplies && replies.length > 0 && (
        <div className="ml-14 mt-4 space-y-4">
          {replies.map(reply => (
            <div key={reply._id}>
              <CommentItem 
                comment={reply} 
                onReplyClick={() => setShowReplyInput(true)} // Clicking reply on a reply just opens the main thread reply box
                onHide={onHide}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
