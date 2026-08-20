# 📋 Future Features TODO - Flutter Mobile App

**Last Updated:** 2026-08-21  
**Current Focus:** Rider App Only

---

## 🚫 Features Currently Commented Out

These features exist in the codebase but are **NOT active** for Rider app. They are preserved for future development.

### 🔐 Admin Features (For Future)
- [ ] `admin/screens/admin_home_screen.dart` - Admin dashboard
- [ ] `admin/screens/analytics_screen.dart` - Analytics & reports
- [ ] `admin/screens/fleet_screen.dart` - Fleet management
- [ ] `admin/screens/finance_screen.dart` - Finance dashboard
- [ ] `admin/screens/audit_logs_screen.dart` - Audit logs
- [ ] `admin/screens/hubs_screen.dart` - Hub management

**Status:** Code exists, not tested, not integrated in Rider app

### 🏪 Merchant Features (For Future)
- [ ] `merchant/screens/merchant_home_screen.dart` - Merchant dashboard
- [ ] `merchant/screens/orders_screen.dart` - Order management
- [ ] `merchant/screens/pickup_requests_screen.dart` - Pickup requests

**Status:** Code exists, not tested, not integrated in Rider app

### 📦 Customer Tracking (For Future)
- [ ] `tracking/screens/public_tracking_screen.dart` - Public tracking page
- [ ] `tracking/widgets/live_map_view.dart` - Real-time map

**Status:** Code exists, not tested, not integrated in Rider app

---

## 🚀 Rider App - Future Enhancements

### Phase 2: Camera & Scanner
- [ ] **POD Signature Capture** - Digital signature on delivery
- [ ] **POD Photo Upload** - Take photo proof of delivery
- [ ] **Barcode Scanner Deep Integration** - Scan to auto-fill task details
- [ ] **QR Code for COD** - Generate QR for customer payment

### Phase 3: Advanced Features
- [ ] **Push Notifications** - Real-time alerts for new tasks
- [ ] **Voice Commands** - "Navigate to next stop"
- [ ] **Battery Optimization** - Reduce GPS drain
- [ ] **Offline Map Caching** - Pre-download route maps

### Phase 4: Analytics & Insights
- [ ] **Daily Performance Report** - End of day summary
- [ ] **Earnings Breakdown** - Weekly/monthly earnings
- [ ] **Route History** - View past routes
- [ ] **Fuel Calculator** - Estimate fuel cost

---

## 🔧 Technical Debt & Improvements

### Code Quality
- [ ] Add unit tests for Cubit logic
- [ ] Add widget tests for screens
- [ ] Add integration tests for critical flows
- [ ] Improve error handling with custom exceptions
- [ ] Add logging service for debugging

### Performance
- [ ] Optimize image loading (cached_network_image)
- [ ] Lazy load task history
- [ ] Reduce bundle size (tree shaking)
- [ ] Profile and optimize frame rates

### Security
- [ ] Implement biometric auth
- [ ] Encrypt offline cache
- [ ] Add certificate pinning
- [ ] Secure COD transaction logs

### UX Polish
- [ ] Add skeleton loaders
- [ ] Improve loading animations
- [ ] Add haptic feedback
- [ ] Dark mode support
- [ ] Localization (multi-language)

---

## 📱 Platform-Specific Features

### Android
- [ ] Android Auto integration
- [ ] Wear OS watch app
- [ ] Background service optimization
- [ ] Custom notification channels

### iOS
- [ ] CarPlay integration
- [ ] Apple Watch app
- [ ] Background location updates
- [ ] Siri shortcuts

---

## 🌐 Backend Integration (When Backend Ready)

- [ ] Real-time WebSocket for live updates
- [ ] GraphQL API integration
- [ ] File upload (photos, signatures)
- [ ] Push notification FCM tokens
- [ ] Analytics event tracking

---

## 📚 Documentation Needed

- [ ] API documentation
- [ ] Widget documentation
- [ ] State management flow diagrams
- [ ] Deployment guide (Play Store/App Store)
- [ ] User manual (PDF)

---

## ⚠️ Known Issues / Limitations

1. **Mock Data Fallback** - API calls fallback to hardcoded data if backend unavailable
2. **GPS Permission** - Requires manual permission on first launch
3. **Camera Permission** - Scanner requires camera permission
4. **Offline Sync** - Large queues might slow down sync
5. **Image Compression** - POD photos not compressed yet

---

## 💡 Ideas for Later

- **Gamification** - Badges, streaks, leaderboards
- **Social Features** - Rider chat, tips sharing
- **Customer Rating** - Rate delivery experience
- **Route Sharing** - Share ETA with customer via SMS
- **Fuel Stations** - Show nearby fuel stations on route
- **Weather Integration** - Show weather along route

---

## 📝 Notes

- All future features should be **Rider-focused** for now
- Admin/Merchant features are **low priority**
- Focus on **offline-first** design
- Keep **design consistent** with web app
- Test on **real devices** before release

---

**Priority:** Focus on completing Rider app before expanding to other roles.

**Next Milestone:** Get Rider app to production, then consider Admin/Merchant modules.
