import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/app_compliance_dialogs.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../../admin/screens/admin_home_screen.dart';
import '../../rider/screens/rider_home_screen.dart';
import '../../merchant/screens/merchant_home_screen.dart';


class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController =
      TextEditingController(text: 'rider@shohnaat.com');
  final TextEditingController _passwordController =
      TextEditingController(text: 'rider123');
  bool _obscurePassword = true;
  String _selectedRole = 'rider';

  final Map<String, Map<String, String>> _rolePresets = {
    'rider': {
      'email': 'rider@shohnaat.com',
      'pass': 'rider123',
      'label': 'Field Rider App',
    },
    'merchant': {
      'email': 'merchant@shohnaat.com',
      'pass': 'merchant123',
      'label': 'Merchant Portal',
    },
    'super_admin': {
      'email': 'admin@shohnaat.com',
      'pass': 'admin123',
      'label': 'Admin Console',
    },
    'operator': {
      'email': 'operator@shohnaat.com',
      'pass': 'operator123',
      'label': 'Hub Operator',
    },
  };

  void _onSelectRole(String role) {
    setState(() {
      _selectedRole = role;
      _emailController.text = _rolePresets[role]!['email']!;
      _passwordController.text = _rolePresets[role]!['pass']!;
    });
  }

  void _onLogin() {
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    if (email.isNotEmpty && password.isNotEmpty) {
      context.read<AuthCubit>().login(email: email, password: password);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.danger,
              ),
            );
          } else if (state is Authenticated) {
            if (state.role == 'super_admin' || state.role == 'operator') {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const AdminHomeScreen()),
              );
            } else if (state.role == 'rider') {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const RiderHomeScreen()),
              );
            } else {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const MerchantHomeScreen()),
              );
            }
          }

        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Icon & Header
                    Center(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: Image.asset(
                          'assets/images/app_logo.png',
                          width: 64,
                          height: 64,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            width: 64,
                            height: 64,
                            color: AppColors.primary,
                            child: const Icon(LucideIcons.truck, color: Colors.white, size: 32),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'SHOHNAAT',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const Text(
                      'Enterprise Logistics & Delivery App',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 12.5,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Card Container
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Select Role Preset',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Role Pills
                          Row(
                            children: _rolePresets.keys.map((role) {
                              final isSelected = _selectedRole == role;
                              return Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 2.0),
                                  child: InkWell(
                                    onTap: () => _onSelectRole(role),
                                    borderRadius: BorderRadius.circular(6),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      decoration: BoxDecoration(
                                        color: isSelected ? AppColors.primaryLight : AppColors.background,
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(
                                          color: isSelected ? AppColors.primary : AppColors.border,
                                          width: isSelected ? 1.5 : 1.0,
                                        ),
                                      ),
                                      child: Text(
                                        role == 'super_admin' ? 'Admin' : role.toUpperCase(),
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w700,
                                          color: isSelected ? AppColors.primary : AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                          const SizedBox(height: 18),

                          // Email Field
                          AppTextField(
                            label: 'Email Address',
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            prefixIcon: const Icon(LucideIcons.mail, size: 18, color: AppColors.textMuted),
                          ),
                          const SizedBox(height: 14),

                          // Password Field
                          AppTextField(
                            label: 'Password',
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            prefixIcon: const Icon(LucideIcons.lock, size: 18, color: AppColors.textMuted),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                                size: 18,
                                color: AppColors.textMuted,
                              ),
                              onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                            ),
                          ),
                          const SizedBox(height: 22),

                          // Submit Button
                          AppButton(
                            text: 'Sign In to Account',
                            onPressed: _onLogin,
                            isLoading: isLoading,
                            isFullWidth: true,
                            size: AppButtonSize.lg,
                            icon: const Icon(LucideIcons.arrowRight, size: 18),
                          ),
                          const SizedBox(height: 18),

                          // Google Play Mandatory Privacy Policy Link
                          GestureDetector(
                            onTap: () => AppComplianceDialogs.showPrivacyPolicy(context),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(LucideIcons.shieldCheck, size: 14, color: AppColors.textMuted),
                                SizedBox(width: 6),
                                Text(
                                  'Privacy Policy & Data Safety',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textMuted,
                                    decoration: TextDecoration.underline,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
