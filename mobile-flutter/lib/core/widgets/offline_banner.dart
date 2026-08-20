import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../constants/app_colors.dart';

/// Banner showing offline status and pending sync count
class OfflineBanner extends StatelessWidget {
  final bool isOnline;
  final int pendingCount;
  final VoidCallback? onSyncNow;

  const OfflineBanner({
    super.key,
    required this.isOnline,
    required this.pendingCount,
    this.onSyncNow,
  });

  @override
  Widget build(BuildContext context) {
    if (isOnline && pendingCount == 0) {
      return const SizedBox.shrink();
    }

    if (!isOnline) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        color: AppColors.warning,
        child: Row(
          children: [
            const Icon(
              LucideIcons.wifiOff,
              size: 16,
              color: Colors.white,
            ),
            const SizedBox(width: 10),
            const Expanded(
              child: Text(
                'Offline Mode — Actions queued for auto-sync',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            if (pendingCount > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFD97706),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$pendingCount queued',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      );
    }

    // Online but has pending sync
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      color: AppColors.primary,
      child: Row(
        children: [
          const SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              valueColor: AlwaysStoppedAnimation(Colors.white),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Syncing $pendingCount offline action${pendingCount != 1 ? 's' : ''}...',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          if (onSyncNow != null)
            TextButton(
              onPressed: onSyncNow,
              style: TextButton.styleFrom(
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text(
                'SYNC NOW',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
