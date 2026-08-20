import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';
import '../cubit/auth_cubit.dart';
import '../cubit/auth_state.dart';
import '../../rider/screens/rider_main_shell.dart';

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

  void _quickLaunchRider() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const RiderMainShell()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.navyBackground,
      body: BlocConsumer<AuthCubit, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const RiderMainShell()),
            );
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
                            width: 76,
                            height: 76,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Container(
                              width: 76,
                              height: 76,
                              color: AppColors.primary,
                              child: const Icon(LucideIcons.bike, color: Colors.white, size: 38),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'SHOHNAAT RIDER PRO',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Courier Navigation & Dispatch Companion',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.cyanAccent,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.4,
                      ),
                    ),

                    const SizedBox(height: 28),

                    // Quick 1-Tap Launch Button
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF1E3A8A), Color(0xFF0284C7)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(LucideIcons.zap, color: Colors.amberAccent, size: 20),
                              SizedBox(width: 8),
                              Text(
                                'Instant Fast Access',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Launch directly into the Rider Hub with full runsheet & GPS tools.',
                            style: TextStyle(color: Colors.white70, fontSize: 11.5),
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _quickLaunchRider,
                              icon: const Icon(LucideIcons.arrowRight, size: 16, color: AppColors.navyBackground),
                              label: const Text(
                                'Start Shift as Courier Rider',
                                style: TextStyle(color: AppColors.navyBackground, fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Or Sign In with Credentials
                    Container(
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: AppColors.darkCardGradient,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.navyBorder.withValues(alpha: 0.9), width: 1.2),
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Sign In with Rider Credentials',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Email / Phone Field
                            AppTextField(
                              controller: _emailController,
                              label: 'Rider Email or Phone',
                              hint: 'rider@shohnaat.com',
                              keyboardType: TextInputType.emailAddress,
                              prefixIcon: LucideIcons.user,
                              validator: (val) =>
                                  val == null || val.isEmpty ? 'Enter rider account' : null,
                            ),

                            const SizedBox(height: 12),

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
                                  val == null || val.length < 4 ? 'Enter valid password' : null,
                            ),

                            const SizedBox(height: 18),

                            // Login Button
                            AppButton(
                              text: 'Authenticate Rider Account',
                              isLoading: isLoading,
                              icon: const Icon(LucideIcons.logIn, size: 16),
                              onPressed: _onLoginPressed,
                            ),
                          ],
                        ),
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
}
