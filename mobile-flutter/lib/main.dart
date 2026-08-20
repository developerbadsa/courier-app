import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/theme/app_theme.dart';
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
      
      // Global Flutter UI Framework Error Handler
      FlutterError.onError = (FlutterErrorDetails details) {
        FlutterError.presentError(details);
        developer.log('Flutter Error caught: ${details.exception}', stackTrace: details.stack);
      };

      runApp(const ShohnaatApp());
    },
    (Object error, StackTrace stack) {
      // Global Asynchronous Error Shield
      developer.log('Global Async Error caught: $error', stackTrace: stack);
    },
  );
}


class ShohnaatApp extends StatelessWidget {
  const ShohnaatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(create: (_) => AuthRepository()),
        RepositoryProvider(create: (_) => RiderRepository()),
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
          theme: AppTheme.lightTheme,
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
