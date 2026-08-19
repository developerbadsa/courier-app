'use client';

import React, { useState } from 'react';
import {
  Key, Globe, Shield, Copy, Check, Eye, EyeOff, Plus, Trash2,
  ArrowLeft, Zap, FileCode, Send, RotateCcw, ExternalLink, Code,
  AlertTriangle, CheckCircle2, Clock, XCircle, Book,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout';
import { Button, Card, Badge, Tabs, Modal, Input, DataTable, Column } from '@/components/ui';

/* ── Types ── */
interface ApiKey { id: string; type: string; prefix: string; enabled: boolean; createdAt: string; }
interface Webhook { id: string; url: string; events: string[]; isActive: boolean; deliveryCount: number; createdAt: string; }
interface DeliveryLog { id: string; event: string; status: string; statusCode: number; attempts: number; url: string; timestamp: string; }

/* ── Mock Data ── */
const MOCK_KEYS: ApiKey[] = [
  { id: 'live', type: 'live', prefix: 'shn_live_a1b2c3d4', enabled: true, createdAt: 'Aug 19, 2026' },
  { id: 'test', type: 'test', prefix: 'shn_test_e5f6g7h8', enabled: true, createdAt: 'Test mode' },
];

const MOCK_WEBHOOKS: Webhook[] = [
  { id: 'wh-1', url: 'https://api.apexglobal.com/shohnaat/webhook', events: ['shipment.delivered', 'cod.settled'], isActive: true, deliveryCount: 248, createdAt: 'Aug 18' },
  { id: 'wh-2', url: 'https://hooks.zapier.com/shohnaat', events: ['shipment.created', 'shipment.picked_up', 'shipment.in_transit'], isActive: true, deliveryCount: 1024, createdAt: 'Aug 15' },
];

const MOCK_DELIVERIES: DeliveryLog[] = [
  { id: 'del-1', event: 'shipment.delivered', status: 'delivered', statusCode: 200, attempts: 1, url: 'https://api.apexglobal.com/shohnaat/webhook', timestamp: '2 min ago' },
  { id: 'del-2', event: 'cod.settled', status: 'delivered', statusCode: 200, attempts: 1, url: 'https://api.apexglobal.com/shohnaat/webhook', timestamp: '15 min ago' },
  { id: 'del-3', event: 'shipment.created', status: 'failed', statusCode: 503, attempts: 5, url: 'https://hooks.zapier.com/shohnaat', timestamp: '1h ago' },
  { id: 'del-4', event: 'shipment.picked_up', status: 'delivered', statusCode: 200, attempts: 2, url: 'https://hooks.zapier.com/shohnaat', timestamp: '2h ago' },
  { id: 'del-5', event: 'shipment.in_transit', status: 'retrying', statusCode: 502, attempts: 3, url: 'https://hooks.zapier.com/shohnaat', timestamp: '3h ago' },
];

const EVENTS = [
  { key: 'shipment.created', label: 'Shipment Created' },
  { key: 'shipment.picked_up', label: 'Picked Up' },
  { key: 'shipment.in_transit', label: 'In Transit' },
  { key: 'shipment.out_for_delivery', label: 'Out for Delivery' },
  { key: 'shipment.delivered', label: 'Delivered' },
  { key: 'shipment.failed', label: 'Delivery Failed' },
  { key: 'cod.settled', label: 'COD Settled' },
];

const CURL_SNIPPET = `curl -X POST https://api.shohnaat.rahimbadsa.me/api/v1/shipments \\
  -H "Authorization: Bearer shn_live_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "consigneeName": "John Doe",
    "consigneePhone": "+15551234567",
    "pickupAddressId": "addr_123",
    "deliveryAddressId": "addr_456",
    "paymentType": "COD",
    "codAmount": 50.00
  }'`;

const NODE_SNIPPET = `const response = await fetch('https://api.shohnaat.rahimbadsa.me/api/v1/shipments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer shn_live_your_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    consigneeName: 'John Doe',
    consigneePhone: '+15551234567',
    pickupAddressId: 'addr_123',
    deliveryAddressId: 'addr_456',
    paymentType: 'COD',
    codAmount: 50.00,
  }),
});

const data = await response.json();`;

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  retrying: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-slate-50 text-slate-700 border-slate-200',
};

/* ── Page ── */
export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [keys, setKeys] = useState(MOCK_KEYS);
  const [newKeyModal, setNewKeyModal] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [webhookModal, setWebhookModal] = useState(false);
  const [webhookForm, setWebhookForm] = useState({ url: '', events: [] as string[] });
  const [snippetTab, setSnippetTab] = useState<'curl' | 'node'>('curl');
  const [docExpanded, setDocExpanded] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateKey = () => {
    const key = `shn_live_${Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => b.toString(16).padStart(2, '0')).join('')}`;
    setNewKeyValue(key);
    setNewKeyModal(true);
  };

  const toggleWebhookEvent = (event: string) => {
    setWebhookForm((prev) => ({
      ...prev,
      events: prev.events.includes(event) ? prev.events.filter((e) => e !== event) : [...prev.events, event],
    }));
  };

  return (
    <DashboardLayout role="merchant" title="Developer API & Webhooks" subtitle="Manage API keys, webhook subscriptions, and integration documentation">
      <div className="mb-2">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'keys', label: 'API Keys' },
          { key: 'webhooks', label: 'Webhooks' },
          { key: 'docs', label: 'API Docs' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-0"
      />

      {/* ═══ Overview Tab ═══ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600"><Key className="w-4 h-4" /></div>
                <div><div className="text-sm font-bold text-slate-900">API Keys</div><div className="text-[11px] text-slate-500">{keys.length} keys active</div></div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('keys')}>Manage Keys</Button>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Globe className="w-4 h-4" /></div>
                <div><div className="text-sm font-bold text-slate-900">Webhooks</div><div className="text-[11px] text-slate-500">{MOCK_WEBHOOKS.length} endpoints</div></div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('webhooks')}>Manage Webhooks</Button>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600"><Book className="w-4 h-4" /></div>
                <div><div className="text-sm font-bold text-slate-900">API Documentation</div><div className="text-[11px] text-slate-500">Interactive docs & snippets</div></div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('docs')}>View Docs</Button>
            </Card>
          </div>

          {/* Quick Code Snippet */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Code className="w-4 h-4 text-blue-600" /> Quick Start</h3>
              <div className="flex gap-1">
                <button onClick={() => setSnippetTab('curl')} className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${snippetTab === 'curl' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>cURL</button>
                <button onClick={() => setSnippetTab('node')} className={`px-3 py-1 text-[11px] font-semibold rounded-lg ${snippetTab === 'node' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>Node.js</button>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-[#0F172A] text-slate-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">{snippetTab === 'curl' ? CURL_SNIPPET : NODE_SNIPPET}</pre>
              <button onClick={() => handleCopy(snippetTab === 'curl' ? CURL_SNIPPET : NODE_SNIPPET, 'snippet')} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg">
                {copiedKey === 'snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ API Keys Tab ═══ */}
      {activeTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">API keys authenticate your requests. Never share your secret key.</p>
            <Button variant="primary" size="sm" onClick={handleGenerateKey} leftIcon={<Key className="w-3.5 h-3.5" />}>Generate New Key</Button>
          </div>
          <div className="space-y-3">
            {keys.map((key) => (
              <Card key={key.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${key.type === 'live' ? 'bg-amber-50 border border-amber-100 text-amber-600' : 'bg-slate-100 border border-slate-200 text-slate-500'}`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.type === 'live' ? 'amber' : 'default'} size="sm">{key.type.toUpperCase()}</Badge>
                      <span className="font-mono text-xs font-semibold text-slate-800">{key.prefix}••••••••</span>
                      <button onClick={() => handleCopy(key.prefix, key.id)} className="text-slate-400 hover:text-slate-600">
                        {copiedKey === key.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{key.createdAt}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.enabled ? 'green' : 'default'} size="sm" dot>{key.enabled ? 'Active' : 'Disabled'}</Badge>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-4 bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-700">Security Notice</div>
                <div className="text-[11px] text-amber-600 mt-0.5">Your API key is shown only once when generated. Store it securely. If compromised, revoke and regenerate immediately.</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ Webhooks Tab ═══ */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Webhooks send real-time events to your server. Verify signatures with <code className="bg-slate-100 px-1 rounded">X-Shohnaat-Signature</code>.</p>
            <Button variant="primary" size="sm" onClick={() => setWebhookModal(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>New Webhook</Button>
          </div>

          {/* Webhook List */}
          {MOCK_WEBHOOKS.map((wh) => (
            <Card key={wh.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"><Globe className="w-4 h-4" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-mono">{wh.url}</span>
                      <Badge variant={wh.isActive ? 'green' : 'default'} size="sm">{wh.isActive ? 'Active' : 'Paused'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {wh.events.map((ev) => (
                        <span key={ev} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{ev}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">{wh.deliveryCount}</div>
                  <div className="text-[10px] text-slate-400">deliveries</div>
                </div>
              </div>
            </Card>
          ))}

          {/* Delivery Logs */}
          <h3 className="text-sm font-bold text-slate-900 mt-6">Recent Deliveries</h3>
          <div className="space-y-2">
            {MOCK_DELIVERIES.map((del) => (
              <div key={del.id} className={`flex items-center gap-3 p-3 rounded-xl border ${STATUS_COLORS[del.status] || 'bg-slate-50 border-slate-200'}`}>
                <div className="shrink-0">
                  {del.status === 'delivered' ? <CheckCircle2 className="w-4 h-4" /> :
                   del.status === 'failed' ? <XCircle className="w-4 h-4" /> :
                   <RotateCcw className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={del.status === 'delivered' ? 'green' : del.status === 'failed' ? 'default' : 'amber'} size="sm">{del.event}</Badge>
                    <span className="text-[10px] font-mono text-slate-500">HTTP {del.statusCode}</span>
                    <span className="text-[10px] text-slate-400">{del.attempts} attempt{del.attempts > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">{del.url}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">{del.timestamp}</span>
                  {del.status === 'failed' && (
                    <Button variant="ghost" size="sm" className="h-6 text-[10px]"><RotateCcw className="w-3 h-3 mr-1" /> Retry</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ API Docs Tab ═══ */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Authentication</h3>
            <p className="text-xs text-slate-600 mb-3">Include your API key in the Authorization header:</p>
            <div className="bg-[#0F172A] text-slate-300 p-3 rounded-lg text-[11px] font-mono">
              Authorization: Bearer shn_live_your_key_here
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Endpoints</h3>
            <div className="space-y-3">
              {[
                { method: 'POST', path: '/api/v1/shipments', desc: 'Create a new shipment', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { method: 'GET', path: '/api/v1/shipments/:id', desc: 'Get shipment details', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { method: 'GET', path: '/api/v1/shipments/track/:trackingNumber', desc: 'Track by number (public)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { method: 'GET', path: '/api/v1/rates/calculate', desc: 'Calculate shipping rate', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                { method: 'POST', path: '/api/v1/addresses', desc: 'Create address', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                { method: 'GET', path: '/api/v1/addresses', desc: 'List addresses', color: 'bg-blue-50 text-blue-700 border-blue-200' },
              ].map((ep, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ep.color}`}>{ep.method}</span>
                  <code className="text-xs font-mono font-semibold text-slate-800">{ep.path}</code>
                  <span className="text-[11px] text-slate-500 ml-auto">{ep.desc}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Webhook Signature Verification</h3>
            <p className="text-xs text-slate-600 mb-3">Verify webhook authenticity using HMAC SHA256:</p>
            <pre className="bg-[#0F172A] text-slate-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto">{`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your Express route:
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['x-shohnaat-signature'];
  const isValid = verifyWebhookSignature(req.body, sig, WEBHOOK_SECRET);
  if (!isValid) return res.status(401).send('Invalid signature');
  // Process webhook...
  res.status(200).send('OK');
});`}</pre>
          </Card>
        </div>
      )}

      {/* ═══ New Key Modal ═══ */}
      <Modal isOpen={newKeyModal} onClose={() => setNewKeyModal(false)} title="API Key Generated" size="lg"
        footer={<Button variant="primary" size="sm" onClick={() => { setNewKeyModal(false); setNewKeyValue(''); }}>Done</Button>}>
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-700">Save this key now!</div>
              <div className="text-[11px] text-amber-600">This key will not be shown again. Copy and store it securely.</div>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Your API Key</div>
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono font-bold text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 flex-1 break-all">{newKeyValue}</code>
              <button onClick={() => handleCopy(newKeyValue, 'newkey')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-slate-200">
                {copiedKey === 'newkey' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ═══ New Webhook Modal ═══ */}
      <Modal isOpen={webhookModal} onClose={() => setWebhookModal(false)} title="Register Webhook" size="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setWebhookModal(false)}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!webhookForm.url || webhookForm.events.length === 0} leftIcon={<Send className="w-3.5 h-3.5" />}>Create Webhook</Button>
          </>
        }>
        <div className="space-y-4">
          <Input label="Endpoint URL" placeholder="https://your-server.com/webhook" value={webhookForm.url} onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })} />
          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Subscribe to Events</label>
            <div className="space-y-2">
              {EVENTS.map((ev) => (
                <label key={ev.key} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${webhookForm.events.includes(ev.key) ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                  <input type="checkbox" checked={webhookForm.events.includes(ev.key)} onChange={() => toggleWebhookEvent(ev.key)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">{ev.key}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
