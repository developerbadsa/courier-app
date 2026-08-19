'use client';

import React, { useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  AlertTriangle,
  Settings,
  RefreshCw,
  TestTube,
  Package,
  Truck,
  CheckCircle,
  XCircleIcon,
  RotateCcw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Input, Modal } from '@/components/ui';

/* ── Types ── */
interface NotificationSettings {
  email: {
    enabled: boolean;
    shipment_booked: boolean;
    out_for_delivery: boolean;
    delivered: boolean;
    shipment_failed: boolean;
    pickup_scheduled: boolean;
  };
  sms: {
    enabled: boolean;
    shipment_booked: boolean;
    out_for_delivery: boolean;
    delivered: boolean;
    shipment_failed: boolean;
    pickup_scheduled: boolean;
  };
  channels: {
    merchantEmail: boolean;
    consigneeEmail: boolean;
    merchantSms: boolean;
    consigneeSms: boolean;
  };
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

interface NotificationStat {
  event: string;
  count: number;
  channel: string;
}

/* ── Event Definitions ── */
const EVENT_DEFINITIONS = [
  { key: 'shipment_booked', label: 'Shipment Booked', icon: Package, color: 'blue', description: 'When a new shipment is created' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'amber', description: 'When shipment is assigned to rider' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'emerald', description: 'When delivery is confirmed' },
  { key: 'shipment_failed', label: 'Delivery Failed', icon: XCircleIcon, color: 'red', description: 'When delivery attempt fails' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock, color: 'purple', description: 'When pickup is scheduled' },
] as const;

/* ── Mock Data ── */
const MOCK_SETTINGS: NotificationSettings = {
  email: {
    enabled: true,
    shipment_booked: true,
    out_for_delivery: true,
    delivered: true,
    shipment_failed: true,
    pickup_scheduled: true,
  },
  sms: {
    enabled: false,
    shipment_booked: false,
    out_for_delivery: true,
    delivered: true,
    shipment_failed: true,
    pickup_scheduled: false,
  },
  channels: {
    merchantEmail: true,
    consigneeEmail: true,
    merchantSms: false,
    consigneeSms: false,
  },
};

const MOCK_QUEUE: QueueStats = { waiting: 3, active: 1, completed: 1247, failed: 12, total: 1263 };

const MOCK_LOGS: NotificationStat[] = [
  { event: 'delivered', count: 8420, channel: 'email' },
  { event: 'out_for_delivery', count: 3240, channel: 'email' },
  { event: 'shipment_booked', count: 2890, channel: 'email' },
  { event: 'shipment_failed', count: 362, channel: 'email' },
  { event: 'delivered', count: 1840, channel: 'sms' },
  { event: 'out_for_delivery', count: 1200, channel: 'sms' },
];

export default function NotificationsSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(MOCK_SETTINGS);
  const [queue] = useState<QueueStats>(MOCK_QUEUE);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testEvent, setTestEvent] = useState('delivered');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const toggleEmailEvent = (event: keyof NotificationSettings['email']) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, [event]: !prev.email[event] },
    }));
  };

  const toggleSmsEvent = (event: keyof NotificationSettings['sms']) => {
    setSettings((prev) => ({
      ...prev,
      sms: { ...prev.sms, [event]: !prev.sms[event] },
    }));
  };

  const toggleChannel = (channel: keyof NotificationSettings['channels']) => {
    setSettings((prev) => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel] },
    }));
  };

  const sendTestNotification = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: testEvent, email: testEmail }),
      });
      setTestResult(res.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    }
    setTestSending(false);
  };

  return (
    <DashboardLayout role="admin" title="Notification Settings" subtitle="Configure email & SMS alerts for shipment events">
      {/* Queue Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><Clock className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Queued</div>
              <div className="text-lg font-bold text-slate-900">{queue.waiting}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600"><Zap className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Processing</div>
              <div className="text-lg font-bold text-slate-900">{queue.active}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Sent</div>
              <div className="text-lg font-bold text-slate-900">{queue.completed.toLocaleString()}</div>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-600"><AlertTriangle className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Failed</div>
              <div className="text-lg font-bold text-slate-900">{queue.failed}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Email Notifications */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Email Notifications</h3>
            </div>
            <button onClick={() => toggleEmailEvent('enabled')} className={`relative w-11 h-6 rounded-full transition-colors ${settings.email.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.email.enabled ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} style={{ transform: settings.email.enabled ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
          </div>
          <div className="space-y-3">
            {EVENT_DEFINITIONS.map((event) => (
              <div key={event.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${event.color}-50 border border-${event.color}-100 flex items-center justify-center text-${event.color}-600`}>
                    <event.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-900">{event.label}</div>
                    <div className="text-[10px] text-slate-400">{event.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleEmailEvent(event.key as keyof NotificationSettings['email'])}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${(settings.email as Record<string, boolean>)[event.key] ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform`} style={{ transform: (settings.email as Record<string, boolean>)[event.key] ? 'translateX(18px)' : 'translateX(2px)', width: '18px', height: '18px' }} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* SMS Notifications */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">SMS Notifications</h3>
            </div>
            <button onClick={() => toggleSmsEvent('enabled')} className={`relative w-11 h-6 rounded-full transition-colors ${settings.sms.enabled ? 'bg-emerald-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform`} style={{ transform: settings.sms.enabled ? 'translateX(22px)' : 'translateX(2px)' }} />
            </button>
          </div>
          {!settings.sms.enabled && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-[11px] text-amber-700">SMS requires Twilio/Vonage API keys in environment variables</span>
            </div>
          )}
          <div className="space-y-3">
            {EVENT_DEFINITIONS.map((event) => (
              <div key={event.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${event.color}-50 border border-${event.color}-100 flex items-center justify-center text-${event.color}-600`}>
                    <event.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-900">{event.label}</div>
                    <div className="text-[10px] text-slate-400">{event.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSmsEvent(event.key as keyof NotificationSettings['sms'])}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${(settings.sms as Record<string, boolean>)[event.key] ? 'bg-emerald-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform`} style={{ transform: (settings.sms as Record<string, boolean>)[event.key] ? 'translateX(18px)' : 'translateX(2px)', width: '18px', height: '18px' }} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recipient Channels */}
      <Card className="p-5 mb-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500" /> Recipient Channels
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { key: 'merchantEmail', label: 'Merchant Email', icon: Mail, color: 'blue' },
            { key: 'consigneeEmail', label: 'Consignee Email', icon: Mail, color: 'blue' },
            { key: 'merchantSms', label: 'Merchant SMS', icon: MessageSquare, color: 'emerald' },
            { key: 'consigneeSms', label: 'Consignee SMS', icon: MessageSquare, color: 'emerald' },
          ] as const).map((ch) => (
            <div key={ch.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${settings.channels[ch.key] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`} onClick={() => toggleChannel(ch.key)}>
              <ch.icon className={`w-4 h-4 ${settings.channels[ch.key] ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`text-[12px] font-semibold ${settings.channels[ch.key] ? 'text-blue-700' : 'text-slate-500'}`}>{ch.label}</span>
              {settings.channels[ch.key] && <CheckCircle2 className="w-4 h-4 text-blue-600 ml-auto" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Volume Chart */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Notification Volume (Last 30 Days)</h3>
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-3 h-3" />}>Refresh</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-semibold text-slate-500">Event</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Email</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">SMS</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {EVENT_DEFINITIONS.map((event) => {
                const emailCount = MOCK_LOGS.find(l => l.event === event.key && l.channel === 'email')?.count || 0;
                const smsCount = MOCK_LOGS.find(l => l.event === event.key && l.channel === 'sms')?.count || 0;
                return (
                  <tr key={event.key} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <event.icon className={`w-3.5 h-3.5 text-${event.color}-500`} />
                        <span className="font-semibold text-slate-900">{event.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{emailCount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">{smsCount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">{(emailCount + smsCount).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Test Notification */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Send Test Notification</h3>
          </div>
          <Badge variant="purple" size="sm">Sandbox</Badge>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Recipient Email</label>
            <Input placeholder="test@example.com" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
          </div>
          <div className="w-full sm:w-48">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Event Type</label>
            <select value={testEvent} onChange={(e) => setTestEvent(e.target.value)} className="w-full h-9 px-3 text-[13px] rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {EVENT_DEFINITIONS.map((e) => (
                <option key={e.key} value={e.key}>{e.label}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="sm" leftIcon={<Send className="w-3 h-3" />} onClick={sendTestNotification} disabled={!testEmail || testSending}>
            {testSending ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
        {testResult && (
          <div className={`mt-3 p-3 rounded-lg border flex items-center gap-2 ${testResult === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            {testResult === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
            <span className={`text-[12px] font-semibold ${testResult === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {testResult === 'success' ? 'Test notification queued successfully!' : 'Failed to send test notification. Check SMTP config.'}
            </span>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
