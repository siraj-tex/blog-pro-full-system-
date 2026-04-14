import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';

function Notifications() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !body) {
      toast.error('Title and message are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/notifications/send', {
        title,
        body,
        data: { custom: true }
      });
      toast.success('Push notification sent successfully!');
      setTitle('');
      setBody('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Push Notifications</h1>
        <p className="text-gray-400 mt-1">Send a custom push notification to all app users.</p>
      </div>

      <div className="bg-dark-card rounded-xl p-6 border border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Special Announcement!"
              className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Notification to All Users'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Notifications;
