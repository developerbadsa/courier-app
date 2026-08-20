import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../../rider/screens/rider_home_screen.dart';
import '../../merchant/screens/merchant_home_screen.dart';
import '../../admin/screens/admin_home_screen.dart';
import '../../tracking/screens/customer_tracking_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'rider@shohnaat.com');
  final _passwordController = TextEditingController(text: 'admin123');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onLoginPressed() {
    if (_formKey.currentState?.validate() ?? false) {
      context.read<AuthCubit>().login(
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
    }
  }

  void _quickFill(String email, String password) {
    _emailController.text = email;
    _passwordController.text = password;
    _onLoginPressed();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
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
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.danger,
              ),
            );
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
                    // Brand Logo & Glow Header
                    Center(
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.5),
                              blurRadius: 28,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(22),
                          child: Image.asset(
                            'assets/images/app_logo.png',
                            width: 72,
                            height: 72,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 72,
                              height: 72,
                              color: AppColors.primary,
                              child: const Icon(LucideIcons.truck, color: Colors.white, size: 36),
                            ),
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
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Enterprise Logistics Super App',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.cyanAccent,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.5,
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Glassmorphism Login Card
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: AppColors.darkCardGradient,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.navyBorder.withValues(alpha: 0.9), width: 1.2),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.35),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Sign In to Account',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),

                            // Email Field
                            AppTextField(
                              controller: _emailController,
                              label: 'Email Address',
                              hint: 'name@company.com',
                              keyboardType: TextInputType.emailAddress,
                              prefixIcon: LucideIcons.mail,
                              validator: (val) =>
                                  val == null || !val.contains('@') ? 'Enter a valid email' : null,
                            ),

                            const SizedBox(height: 14),

                            // Password Field
                            AppTextField(
                              controller: _passwordController,
                              label: 'Password',
                              hint: '••••••••',
                              obscureText: _obscurePassword,
                              prefixIcon: LucideIcons.lock,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                                  color: AppColors.textMuted,
                                  size: 18,
                                ),
                                onPressed: () =>
                                    setState(() => _obscurePassword = !_obscurePassword),
                              ),
                              validator: (val) =>
                                  val == null || val.length < 6 ? 'Password must be 6+ chars' : null,
                            ),

                            const SizedBox(height: 20),

                            // Login Button
                            AppButton(
                              text: 'Sign In to Portal',
                              isLoading: isLoading,
                              icon: const Icon(LucideIcons.arrowRight, size: 18),
                              onPressed: _onLoginPressed,
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Quick Demo Roles Header
                    const Text(
                      '⚡ 1-TAP INSTANT ROLE DEMO',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.textMuted,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.0,
                      ),
                    ),

                    const SizedBox(height: 12),

                    // 3 Quick Demo Buttons
                    Row(
                      children: [
                        Expanded(
                          child: _buildQuickRoleBtn(
                            icon: LucideIcons.bike,
                            label: 'Rider',
                            color: AppColors.cyanAccent,
                            onTap: () => _quickFill('rider@shohnaat.com', 'admin123'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildQuickRoleBtn(
                            icon: LucideIcons.store,
                            label: 'Merchant',
                            color: Colors.amberAccent,
                            onTap: () => _quickFill('merchant@shohnaat.com', 'admin123'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _buildQuickRoleBtn(
                            icon: LucideIcons.shieldCheck,
                            label: 'Admin',
                            color: AppColors.purple,
                            onTap: () => _quickFill('admin@shohnaat.com', 'admin123'),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Public Live Tracking Shortcut
                    OutlinedButton.icon(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const CustomerTrackingScreen(),
                          ),
                        );
                      },
                      icon: const Icon(LucideIcons.search, size: 16, color: AppColors.cyanAccent),
                      label: const Text(
                        'Public Tracking Lookup (No Login Required)',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.navyBorder),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),

                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildQuickRoleBtn({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.navySurface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.navyBorder),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 11.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
