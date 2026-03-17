import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UserMenu from '@/components/UserMenu';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      if (error) throw error;

      await supabase.functions.invoke('send-contact-notification', {
        body: { name: form.name.trim(), email: form.email.trim(), message: form.message.trim() },
      });

      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen bg-[var(--background)]"
    >
      <div className="relative z-10">
        <nav className="absolute top-0 right-0 p-6 z-20">
          <UserMenu />
        </nav>

        <div className="pt-24 pb-20 px-4 max-w-xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="font-display font-bold text-4xl md:text-5xl text-white mb-3 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-gray-400 text-lg mb-10">
            Have a question, suggestion, or just want to say hello? Drop a message below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
              <input
                id="contact-name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded bg-[#2A2A2A] border border-[var(--border)] px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
              <input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded bg-[#2A2A2A] border border-[var(--border)] px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Message</label>
              <textarea
                id="contact-message"
                placeholder="What's on your mind?"
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded bg-[#2A2A2A] border border-[var(--border)] px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 rounded bg-[var(--primary)] hover:bg-red-700 text-white px-8 py-3 text-sm font-bold transition-colors duration-200 disabled:opacity-50"
            >
              <Send size={16} />
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>

        <Footer />
      </div>
    </motion.div>
  );
}
