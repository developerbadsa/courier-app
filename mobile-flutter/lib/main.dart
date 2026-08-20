import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
import 'core/services/connectivity_service.dart';
import 'features/auth/cubit/auth_cubit.dart';
import 'features/auth/repositories/auth_repository.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/rider/cubit/runsheet_cubit.dart';
import 'features/rider/repositories/rider_repository.dart';

import 'dart:async';
import 'dart:developer' as developer;

void main() {
  runZonedGuarded(
    () async {
      WidgetsFlutterBinding.ensureInitialized();

      // Lock orientation to portrait for mobile-first UX
      await SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);

      // Global Flutter UI Framework Error Handler
      FlutterError.onError = (FlutterErrorDetails details) {
        FlutterError.presentError(details);
        developer.log(
          'Flutter Error: ${details.exception}',
          stackTrace: details.stack,
          name: 'ShohnaatApp',
        );
      };

      // Initialize connectivity service
      final connectivityService = ConnectivityService();
      await connectivityService.init();

      runApp(ShohnaatApp(connectivityService: connectivityService));
    },
    (Object error, StackTrace stack) {
      developer.log(
        'Global Async Error: $error',
        stackTrace: stack,
        name: 'ShohnaatApp',
      );
    },
  );
}

class ShohnaatApp extends StatefulWidget {
  final ConnectivityService connectivityService;

  const ShohnaatApp({super.key, required this.connectivityService});

  @override
  State<ShohnaatApp> createState() => _ShohnaatAppState();
}

class _ShohnaatAppState extends State<ShohnaatApp> with WidgetsBindingObserver {
  late final ConnectivityService _connectivity;

  @override
  void initState() {
    super.initState();
    _connectivity = widget.connectivityService;
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // App foreground/background transitions handled here
    if (state == AppLifecycleState.resumed) {
      // App came back to foreground — refresh connectivity
      _connectivity.checkConnectivity();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _connectivity.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(create: (_) => AuthRepository()),
        RepositoryProvider(create: (_) => RiderRepository()),
        RepositoryProvider<ConnectivityService>.value(value: _connectivity),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthCubit(
              authRepository: context.read<AuthRepository>(),
            ),
          ),
          BlocProvider(
            create: (context) => RunsheetCubit(
              repository: context.read<RiderRepository>(),
            ),
          ),
        ],
        child: MaterialApp(
          title: 'Shohnaat Logistics',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.darkLuxuryTheme,
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
