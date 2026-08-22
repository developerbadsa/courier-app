import 'dart:async';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:url_launcher/url_launcher.dart';

class MaintenanceScreen extends StatefulWidget {
  final String title;
  final String message;
  final String? endAt;
  final String hotline;
  final String email;
  final VoidCallback? onRefresh;

  const MaintenanceScreen({
    super.key,
    this.title = 'System Under Scheduled Maintenance',
    this.message =
        'We are currently performing essential platform upgrades to improve service reliability and speed.',
    this.endAt,
    this.hotline = '+880 1700-000000',
    this.email = 'support@shohnaat.com',
    this.onRefresh,
  });

  @override
  State<MaintenanceScreen> createState() => _MaintenanceScreenState();
}

class _MaintenanceScreenState extends State<MaintenanceScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  Timer? _countdownTimer;
  Duration _timeRemaining = Duration.zero;
  bool _isChecking = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _calculateRemainingTime();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _calculateRemainingTime();
    });
  }

  void _calculateRemainingTime() {
    if (widget.endAt == null) return;
    try {
      final target = DateTime.parse(widget.endAt!);
      final now = DateTime.now();
      final diff = target.difference(now);
      if (mounted) {
        setState(() {
          _timeRemaining = diff.isNegative ? Duration.zero : diff;
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _handleRefresh() async {
    setState(() => _isChecking = true);
    if (widget.onRefresh != null) {
      widget.onRefresh!();
    }
    await Future.delayed(const Duration(milliseconds: 1000));
    if (mounted) {
      setState(() => _isChecking = false);
    }
  }

  Future<void> _callHotline() async {
    final uri = Uri.parse('tel:${widget.hotline.replaceAll(' ', '')}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendEmail() async {
    final uri = Uri.parse('mailto:${widget.email}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090D16),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 16),
              // Brand Bar
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2563EB), Color(0xFF3B82F6)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      LucideIcons.truck,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'SHOHNAAT',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 15,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Text(
                        'Logistics Network',
                        style: TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 36),

              // Status Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
                    width: 1,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    AnimatedBuilder(
                      animation: _pulseController,
                      builder: (context, child) {
                        return Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFF59E0B),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFF59E0B)
                                    .withValues(alpha: _pulseController.value * 0.8),
                                blurRadius: 6,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'SCHEDULED MAINTENANCE',
                      style: TextStyle(
                        color: Color(0xFFFBBF24),
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Glowing Wrench Icon
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                    ),
                  ),
                  Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: const Color(0xFF334155),
                        width: 1.5,
                      ),
                    ),
                    child: const Icon(
                      LucideIcons.wrench,
                      color: Color(0xFFFBBF24),
                      size: 36,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Title
              Text(
                widget.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.4,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 12),

              // Message
              Text(
                widget.message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Color(0xFF94A3B8),
                  fontSize: 13,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 28),

              // Countdown Timer
              if (_timeRemaining > Duration.zero) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFF1E293B)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(LucideIcons.clock, size: 14, color: Color(0xFF60A5FA)),
                          SizedBox(width: 6),
                          Text(
                            'ESTIMATED SERVICE RESTORATION',
                            style: TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.0,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildTimeBlock(
                            _timeRemaining.inDays.toString().padLeft(2, '0'),
                            'Days',
                          ),
                          _buildTimeBlock(
                            (_timeRemaining.inHours % 24).toString().padLeft(2, '0'),
                            'Hours',
                          ),
                          _buildTimeBlock(
                            (_timeRemaining.inMinutes % 60).toString().padLeft(2, '0'),
                            'Mins',
                          ),
                          _buildTimeBlock(
                            (_timeRemaining.inSeconds % 60).toString().padLeft(2, '0'),
                            'Secs',
                            isAccent: true,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
              ],

              // Actions
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _isChecking ? null : _handleRefresh,
                  icon: _isChecking
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(LucideIcons.refreshCw, size: 18),
                  label: Text(
                    _isChecking ? 'Checking Status...' : 'Check Again & Refresh',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 4,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _callHotline,
                      icon: const Icon(LucideIcons.phone, size: 16, color: Color(0xFF34D399)),
                      label: const Text('Call Hotline'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFF334155)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _sendEmail,
                      icon: const Icon(LucideIcons.mail, size: 16, color: Color(0xFF60A5FA)),
                      label: const Text('Email Help'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Color(0xFF334155)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Footer
              Text(
                'Hotline: ${widget.hotline} • ${widget.email}',
                style: const TextStyle(
                  color: Color(0xFF64748B),
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTimeBlock(String value, String label, {bool isAccent = false}) {
    return Container(
      width: 60,
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF070A11),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1E293B)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              color: isAccent ? const Color(0xFFFBBF24) : Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              color: Color(0xFF64748B),
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
