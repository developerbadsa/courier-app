import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme/app_theme.dart';
import 'app_button.dart';

class AppComplianceDialogs {
  /// Google Play Mandatory Privacy Policy Dialog
  static void showPrivacyPolicy(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(LucideIcons.shieldCheck, color: AppColors.primary, size: 24),
            SizedBox(width: 10),
            Text(
              'Privacy & Data Policy',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Shohnaat Logistics operates strictly in compliance with international data safety & Google Play policies.',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 14),
                _policySection(
                  '1. Location & Telemetry Data',
                  'When on duty, rider GPS location is transmitted securely to provide real-time tracking to merchants and customers. Location data is never shared with unauthorized third parties.',
                ),
                _policySection(
                  '2. Camera & Scanner Access',
                  'Camera permission is used solely for optical barcode & QR code scanning of parcel waybills and proof-of-delivery photos.',
                ),
                _policySection(
                  '3. Financial & Ledger Security',
                  'All cash collections (COD) and wallet transactions are recorded on an immutable double-entry ledger with zero plaintext storage of financial credentials.',
                ),
                _policySection(
                  '4. Data Retention & Deletion',
                  'Users have the right to request deletion of their account and personal data at any time via the Account Settings menu.',
                ),
                const SizedBox(height: 8),
                const Text(
                  'Support & Inquiries: compliance@shohnaat.com',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
                ),
              ],
            ),
          ),
        ),
        actions: [
          AppButton(
            text: 'I Understand',
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  /// Google Play Mandatory Account Deletion Request Dialog
  static void showAccountDeletionRequest(BuildContext context, {required VoidCallback onConfirmDelete}) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(LucideIcons.alertTriangle, color: AppColors.danger, size: 24),
            SizedBox(width: 10),
            Text(
              'Delete Account & Data',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.danger),
            ),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Are you sure you want to request permanent deletion of your Shohnaat account?',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 10),
            Text(
              'In compliance with Google Play Data Safety policies, upon confirmation your profile, active sessions, and personal identifiers will be permanently removed.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(context);
              onConfirmDelete();
            },
            child: const Text('Request Deletion'),
          ),
        ],
      ),
    );
  }

  static Widget _policySection(String title, String description) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(description, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
        ],
      ),
    );
  }
}
