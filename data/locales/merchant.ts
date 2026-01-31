
export const merchant = {
  ar: {
    home: {
      welcome: 'لوحة تحكم التاجر',
      welcomeSub: 'أهلاً بك، إليك ملخص لأداء متجرك اليوم.',
      online: 'المتجر متصل',
      paidAmount: 'القيمة المحصلة',
      readyShip: 'جاهزة للشحن',
      inTransit: 'جاري التوصيل',
      delivered: 'تم التسليم (فترة الضمان)',
      late: 'تأخير في الشحن',
      warrantyActive: 'الضمان ساري',
      yourOffer: 'عرضك',
      status: 'الحالة',
      waitingPay: 'بانتظار الدفع',
      expiresIn: 'تنتهي خلال'
    },
    tabs: {
      details: 'التفاصيل',
      security: 'الأمان'
    },
    profile: {
      verified: 'تاجر موثوق',
      rating: 'التقييم',
      manager: 'المسؤول',
      mobile: 'الجوال',
      email: 'البريد',
      openTime: 'وقت الفتح',
      closeTime: 'وقت الإغلاق',
      location: 'موقع المتجر على الخريطة',
      saveSuccess: 'تم حفظ التغييرات بنجاح'
    },
    wallet: {
      readyPayout: 'جاهز للتحويل (أسبوعياً)',
      underWarranty: 'تحت فترة الضمان (48 ساعة)',
      recentTx: 'أحدث المعاملات',
      noTx: 'لا توجد معاملات حتى الآن',
      export: 'تصدير كشف حساب',
      today: 'تاريخ اليوم'
    },
    audit: {
      title: 'سجل النشاط',
      action: 'الإجراء',
      ip: 'عنوان IP',
      date: 'التاريخ',
      status: 'الحالة',
      note: 'يحتفظ النظام بالسجلات لمدة 90 يوماً لأغراض الأمان.'
    },
    resolution: {
      activeCases: 'قضايا نشطة',
      totalResolved: 'تم حلها',
      yourCases: 'قضاياك',
      search: 'بحث برقم القضية...',
      noCases: 'لا توجد قضايا نشطة.'
    },
    kpi: {
      title: 'مؤشرات الأداء (KPIs)',
      subtitle: 'أداء متجرك بناءً على معايير المنصة',
      responseSpeed: 'سرعة الرد',
      prepSpeed: 'سرعة التجهيز',
      rating: 'تقييم العملاء',
      acceptanceRate: 'معدل القبول',
      complaints: 'نسبة الشكاوى',
      hours: 'ساعات',
      excellent: 'ممتاز',
      good: 'جيد',
      risk: 'خطر',
      newRequests: 'طلبات جديدة',
      submittedOffers: 'عروض مقدمة',
      acceptedOffers: 'عروض مقبولة',
      preparing: 'قيد التجهيز',
      totalSales: 'إجمالي المبيعات',
      dueBalance: 'الرصيد المستحق',
      earnings: 'الأرباح',
      weekly: 'أسبوعي'
    },
    alerts: {
      licenseExpiring: 'تنبيه: رخصة البلدية تنتهي قريباً (أقل من 30 يوم).',
      licenseExpired: 'عاجل: انتهت صلاحية رخصة البلدية. تم إيقاف استقبال الطلبات الجديدة.',
      latePrep: 'تنبيه: يوجد طلبات متأخرة في التجهيز.',
      updateLicense: 'تحديث الرخصة',
      restricted: 'الحساب مقيد',
      restrictedDesc: 'تم تقييد حسابك بسبب انتهاء الوثائق الرسمية. يرجى التحديث لاستعادة الصلاحيات.',
      accountRestricted: 'الحساب مقيد',
      attention: 'يرجى الانتباه',
      urgent: 'تنبيهات عاجلة',
      none: 'لا توجد تنبيهات عاجلة'
    },
    merchantSettings: {
      title: 'إعدادات الحساب',
      tabs: {
        account: 'بيانات الحساب',
        security: 'الأمان وكلمة المرور',
        banking: 'البيانات البنكية',
        prefs: 'التفضيلات'
      },
      banking: {
        title: 'الحساب البنكي (IBAN)',
        desc: 'يستخدم هذا الحساب لتحويل مستحقاتك الأسبوعية.',
        label: 'رقم الآيبان SA',
        bankName: 'اسم البنك',
        holder: 'اسم صاحب الحساب',
        warning: 'تنبيه: تغيير الآيبان يتطلب موافقة الإدارة وقد يوقف التحويلات مؤقتاً.'
      },
      prefs: {
        notifTitle: 'تفضيلات الإشعارات',
        whatsapp: 'تلقي تنبيهات عبر واتساب',
        email: 'تلقي نشرة بريدية أسبوعية',
        lang: 'لغة الواجهة'
      },
      sensitiveInfo: '* تم إخفاء المعلومات الحساسة. تواصل مع الإدارة للتعديل.'
    },
    shipping: {
      modalTitle: 'إصدار بوليصة شحن',
      courierLabel: 'شركة الشحن',
      waybillLabel: 'رقم البوليصة',
      dateLabel: 'تاريخ التوصيل المتوقع',
      imageLabel: 'صورة البوليصة',
      confirm: 'تأكيد وشحن الطلب',
      upload: 'اضغط لرفع الصورة',
      generate: 'إصدار البوليصة',
      couriers: {
        aramex: 'أرامكس',
        smsa: 'سمسا',
        dhl: 'دي إتش إل',
        fedex: 'فيديكس',
        other: 'أخرى'
      },
      warnings: {
        late: 'تنبيه: التأخر في الشحن قد يعرضك لغرامة',
        success: 'تم إصدار البوليصة بنجاح'
      },
      noShipments: 'لا توجد شحنات في الطريق',
      noReady: 'لا توجد طلبات جاهزة للشحن'
    },
    marketplace: {
      filterTitle: 'سوق الطلبات',
      searchPlaceholder: 'بحث برقم الطلب، اسم القطعة...',
      timeRemaining: 'الوقت المتبقي',
      makeOffer: 'تقديم عرض',
      viewDetails: 'عرض التفاصيل',
      filters: {
        all: 'الكل',
        toyota: 'تويوتا',
        lexus: 'لكزس',
        hyundai: 'هيونداي'
      },
      noRequests: 'لا توجد طلبات جديدة حالياً'
    },
    offerModal: {
      title: 'تفاصيل الطلب وتقديم العرض',
      vehicleInfo: 'بيانات المركبة',
      partInfo: 'القطعة المطلوبة',
      clientPref: 'تفضيلات العميل',
      yourOffer: 'عرض السعر الخاص بك',
      priceLabel: 'سعر القطعة',
      weightLabel: 'الوزن التقريبي',
      weightUnit: 'كجم',
      partTypeLabel: 'نوع القطعة',
      partTypes: {
        normal: 'قطعة عادية',
        engine: 'ماكينة (Engine)',
        gearbox: 'جيربوكس (Gearbox)'
      },
      warrantyLabel: 'هل يوجد ضمان؟',
      warrantyDurationLabel: 'مدة الضمان',
      deliveryTimeLabel: 'وقت التوصيل المتوقع',
      conditionLabel: 'حالة القطعة',
      notesLabel: 'ملاحظات إضافية',
      uploadLabel: 'صورة القطعة (اختياري)',
      calc: {
        title: 'تفاصيل السعر والأرباح',
        basePrice: 'سعر القطعة',
        shipping: 'تكلفة الشحن',
        subtotal: 'المجموع قبل العمولة',
        commission: 'عمولة المنصة',
        finalCustomerPrice: 'السعر النهائي للعميل',
        merchantNet: 'صافي استحقاق التاجر',
        shippingNote: 'يتم احتساب الشحن تلقائياً بناءً على الوزن والنوع'
      },
      submit: 'إرسال العرض',
      cancel: 'إلغاء',
      conditions: {
        new: 'جديد / بكرتونه',
        used_clean: 'مستعمل نظيف (أصلي)',
        used_avg: 'مستعمل (متوسط)'
      },
      warranties: {
        days3: '3 أيام (تشغيل)',
        month1: 'شهر واحد',
        month3: '3 أشهر',
        month6: '6 أشهر'
      },
      deliveryTimes: {
        d1_3: '1 - 3 أيام',
        d3_5: '3 - 5 أيام',
        d5_7: '5 - 7 أيام'
      }
    },
    menu: {
      home: 'الرئيسية',
      activeOrders: 'الطلبات النشطة',
      marketplace: 'سوق الطلبات',
      myOffers: 'عروضي',
      chats: 'المحادثات',
      profile: 'ملف المتجر',
      docs: 'المستندات',
      settings: 'الإعدادات',
      wallet: 'المحفظة',
      notifications: 'الإشعارات'
    },
    headers: {
      welcome: 'مرحباً،',
      notifications: 'الإشعارات',
      recentOrders: 'آخر الطلبات',
      activeOrders: 'طلبات نشطة'
    },
    status: {
      awaiting_offers: 'بانتظار العروض',
      awaiting_payment: 'بانتظار الدفع',
      preparation: 'جاري التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      disputed: 'نزاع',
      return_requested: 'طلب إرجاع',
      return_approved: 'مقبول للإرجاع'
    },
    timers: {
      offers_expires: 'ينتهي استقبال العروض خلال',
      payment_expires: 'تنتهي مهلة الدفع خلال',
      return_window: 'نافذة الإرجاع تنتهي خلال',
      expired: 'منتهية الصلاحية',
      shipping_deadline: 'يجب الشحن خلال'
    },
    earnings: {
      title: 'الأرباح والمحفظة',
      available: 'الرصيد المستحق',
      pending: 'الرصيد المعلق',
      totalSales: 'إجمالي المبيعات',
      history: 'سجل المعاملات',
      payoutInfo: 'يتم تحويل الأرباح أسبوعياً لحساب المتجر المسجل.',
      table: {
        date: 'التاريخ',
        type: 'النوع',
        order: 'رقم الطلب',
        amount: 'المبلغ',
        status: 'الحالة'
      },
      types: {
        sale: 'عملية بيع',
        payout: 'تحويل بنكي',
        deduction: 'خصم عمولة'
      },
      status: {
        completed: 'مكتمل',
        pending: 'معلق',
        processing: 'قيد المعالجة'
      }
    },
    storeProfile: {
      title: 'ملف المتجر',
      sections: {
        basic: 'البيانات الأساسية',
        contact: 'بيانات الاتصال',
        docs: 'المستندات والتراخيص',
        hours: 'ساعات العمل'
      },
      fields: {
        name: 'اسم المتجر',
        bio: 'نبذة عن المتجر',
        logo: 'الشعار',
        categories: 'الفئات والتخصص',
        cr: 'السجل التجاري',
        license: 'رخصة البلدية',
        expiry: 'تاريخ الانتهاء'
      },
      actions: {
        save: 'حفظ التغييرات',
        upload: 'تحديث المستند',
        edit: 'تعديل'
      },
      alerts: {
        review: 'تنبيه: تعديل هذا الحقل يتطلب مراجعة من الإدارة وقد يؤدي لتعليق الحساب مؤقتاً.'
      }
    },
    documents: {
      title: 'المستندات والتراخيص',
      subtitle: 'إدارة المستندات الرسمية وتحديث التراخيص المنتهية',
      table: {
        doc: 'المستند',
        status: 'الحالة',
        expiry: 'تاريخ الانتهاء',
        actions: 'الإجراءات'
      },
      status: {
        approved: 'معتمد',
        pending: 'قيد المراجعة',
        rejected: 'مرفوض',
        expired: 'منتهي'
      },
      actions: {
        update: 'تحديث',
        view: 'عرض'
      },
      uploadModal: {
        title: 'تحديث المستند',
        desc: 'يرجى رفع نسخة حديثة وواضحة من المستند',
        confirm: 'إرسال للمراجعة'
      }
    },
    notifications: {
      title: 'الإشعارات',
      markAllRead: 'تحديد الكل كمقروء',
      empty: 'لا توجد إشعارات جديدة',
      newOffer: 'عرض جديد',
      offerAccepted: 'تم قبول العرض',
      paymentConfirmed: 'تأكيد الدفع',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      rateRequest: 'طلب تقييم',
      disputeUpdate: 'تحديث نزاع',
      docExpiry: 'تنبيه: اقترب انتهاء صلاحية مستند',
      adminAlert: 'تنبيه إداري'
    }
  },
  en: {
    home: {
      welcome: 'Merchant Dashboard',
      welcomeSub: 'Welcome back, here is your store performance summary.',
      online: 'Store Online',
      paidAmount: 'Collected Amount',
      readyShip: 'Ready to Ship',
      inTransit: 'In Transit',
      delivered: 'Delivered (Warranty Period)',
      late: 'Late Shipping',
      warrantyActive: 'Warranty Active',
      yourOffer: 'Your Offer',
      status: 'Status',
      waitingPay: 'Waiting Payment',
      expiresIn: 'Expires in'
    },
    tabs: {
      details: 'Details',
      security: 'Security'
    },
    profile: {
      verified: 'Verified Merchant',
      rating: 'Rating',
      manager: 'Manager',
      mobile: 'Mobile',
      email: 'Email',
      openTime: 'Open Time',
      closeTime: 'Close Time',
      location: 'Store Location Map',
      saveSuccess: 'Changes saved successfully'
    },
    wallet: {
      readyPayout: 'Ready for payout (Weekly)',
      underWarranty: 'Under Warranty (48h)',
      recentTx: 'Recent Transactions',
      noTx: 'No transactions yet',
      export: 'Export Statement',
      today: 'Today'
    },
    audit: {
      title: 'Activity Log',
      action: 'Action',
      ip: 'IP Address',
      date: 'Date',
      status: 'Status',
      note: 'System keeps logs for 90 days for security purposes.'
    },
    resolution: {
      activeCases: 'Active Cases',
      totalResolved: 'Resolved',
      yourCases: 'Your Cases',
      search: 'Search case ID...',
      noCases: 'No active cases.'
    },
    kpi: {
      title: 'Performance Indicators (KPIs)',
      subtitle: 'Store performance based on platform standards',
      responseSpeed: 'Response Speed',
      prepSpeed: 'Prep Speed',
      rating: 'Customer Rating',
      acceptanceRate: 'Acceptance Rate',
      complaints: 'Complaint Rate',
      hours: 'hours',
      excellent: 'Excellent',
      good: 'Good',
      risk: 'Risk',
      newRequests: 'New Requests',
      submittedOffers: 'Offers Submitted',
      acceptedOffers: 'Offers Accepted',
      preparing: 'Preparing',
      totalSales: 'Total Sales',
      dueBalance: 'Due Balance',
      earnings: 'Earnings',
      weekly: 'Weekly'
    },
    alerts: {
      licenseExpiring: 'Warning: Municipality license expires soon (< 30 days).',
      licenseExpired: 'Urgent: Municipality license expired. New orders stopped.',
      latePrep: 'Warning: Late orders in preparation.',
      updateLicense: 'Update License',
      restricted: 'Account Restricted',
      restrictedDesc: 'Your account is restricted due to expired documents. Please update to restore access.',
      accountRestricted: 'Account Restricted',
      attention: 'Attention Required',
      urgent: 'Urgent Alerts',
      none: 'No urgent alerts'
    },
    merchantSettings: {
      title: 'Account Settings',
      tabs: {
        account: 'Account Info',
        security: 'Security & Password',
        banking: 'Banking Info',
        prefs: 'Preferences'
      },
      banking: {
        title: 'Bank Account (IBAN)',
        desc: 'Used for weekly payouts.',
        label: 'IBAN Number (SA)',
        bankName: 'Bank Name',
        holder: 'Account Holder Name',
        warning: 'Warning: Changing IBAN requires admin approval and may pause payouts.'
      },
      prefs: {
        notifTitle: 'Notification Preferences',
        whatsapp: 'Receive alerts via WhatsApp',
        email: 'Receive weekly newsletter',
        lang: 'Interface Language'
      },
      sensitiveInfo: '* Sensitive contact info is masked. Contact admin to change.'
    },
    shipping: {
      modalTitle: 'Issue Waybill',
      courierLabel: 'Courier',
      waybillLabel: 'Waybill Number',
      dateLabel: 'Expected Delivery Date',
      imageLabel: 'Waybill Image',
      confirm: 'Confirm & Ship',
      upload: 'Click to Upload',
      generate: 'Issue Waybill',
      couriers: {
        aramex: 'Aramex',
        smsa: 'SMSA',
        dhl: 'DHL',
        fedex: 'FedEx',
        other: 'Other'
      },
      warnings: {
        late: 'Warning: Late shipping may result in penalties',
        success: 'Waybill issued successfully'
      },
      noShipments: 'No shipments in transit',
      noReady: 'No new orders waiting for shipping'
    },
    marketplace: {
      filterTitle: 'Marketplace Requests',
      searchPlaceholder: 'Search order ID, part name...',
      timeRemaining: 'Time Remaining',
      makeOffer: 'Make Offer',
      viewDetails: 'View Details',
      filters: {
        all: 'All',
        toyota: 'Toyota',
        lexus: 'Lexus',
        hyundai: 'Hyundai'
      },
      noRequests: 'No new requests at the moment'
    },
    offerModal: {
      title: 'Order Details & Submit Offer',
      vehicleInfo: 'Vehicle Info',
      partInfo: 'Required Part',
      clientPref: 'Client Preferences',
      yourOffer: 'Your Offer Price',
      priceLabel: 'Part Price',
      weightLabel: 'Approx Weight',
      weightUnit: 'kg',
      partTypeLabel: 'Part Type',
      partTypes: {
        normal: 'Normal Part',
        engine: 'Engine',
        gearbox: 'Gearbox'
      },
      warrantyLabel: 'Include Warranty?',
      warrantyDurationLabel: 'Warranty Duration',
      deliveryTimeLabel: 'Expected Delivery',
      conditionLabel: 'Part Condition',
      notesLabel: 'Additional Notes',
      uploadLabel: 'Part Image (Optional)',
      calc: {
        title: 'Price & Profit Breakdown',
        basePrice: 'Part Price',
        shipping: 'Shipping Cost',
        subtotal: 'Subtotal before Commission',
        commission: 'Platform Commission',
        finalCustomerPrice: 'Final Customer Price',
        merchantNet: 'Merchant Net Earning',
        shippingNote: 'Shipping is calculated automatically based on weight and type'
      },
      submit: 'Submit Offer',
      cancel: 'Cancel',
      conditions: {
        new: 'New / In Box',
        used_clean: 'Used Clean (Genuine)',
        used_avg: 'Used (Average)'
      },
      warranties: {
        days3: '3 Days (Testing)',
        month1: '1 Month',
        month3: '3 Months',
        month6: '6 Months'
      },
      deliveryTimes: {
        d1_3: '1 - 3 Days',
        d3_5: '3 - 5 Days',
        d5_7: '5 - 7 Days'
      }
    },
    menu: {
      home: 'Dashboard',
      activeOrders: 'Active Orders',
      marketplace: 'Marketplace',
      myOffers: 'My Offers',
      chats: 'Chats',
      profile: 'Store Profile',
      docs: 'Documents',
      settings: 'Settings',
      wallet: 'Earnings',
      notifications: 'Notifications'
    },
    headers: {
      welcome: 'Welcome,',
      notifications: 'Notifications',
      recentOrders: 'Recent Orders',
      activeOrders: 'Active Orders'
    },
    status: {
      awaiting_offers: 'Awaiting Offers',
      awaiting_payment: 'Awaiting Payment',
      preparation: 'Preparation',
      shipped: 'Shipped',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      disputed: 'Dispute',
      return_requested: 'Return Requested',
      return_approved: 'Return Approved'
    },
    timers: {
      offers_expires: 'Offers expire in',
      payment_expires: 'Payment expires in',
      return_window: 'Return window closes in',
      expired: 'Expired',
      ship_within: 'Ship within',
      shipping_deadline: 'Ship within'
    },
    earnings: {
      title: 'Earnings & Wallet',
      available: 'Available Balance',
      pending: 'Pending Balance',
      totalSales: 'Total Sales',
      history: 'Transaction History',
      payoutInfo: 'Profits are transferred weekly to your registered account.',
      table: {
        date: 'Date',
        type: 'Type',
        order: 'Order #',
        amount: 'Amount',
        status: 'Status'
      },
      types: {
        sale: 'Sale',
        payout: 'Bank Transfer',
        deduction: 'Commission Deduction'
      },
      status: {
        completed: 'Completed',
        pending: 'Pending',
        processing: 'Processing'
      }
    },
    storeProfile: {
      title: 'Store Profile',
      sections: {
        basic: 'Basic Info',
        contact: 'Contact Info',
        docs: 'Documents & Licenses',
        hours: 'Working Hours'
      },
      fields: {
        name: 'Store Name',
        bio: 'Store Bio',
        logo: 'Logo',
        categories: 'Categories',
        cr: 'Commercial Register',
        license: 'Municipality License',
        expiry: 'Expiry Date'
      },
      actions: {
        save: 'Save Changes',
        upload: 'Update Document',
        edit: 'Edit'
      },
      alerts: {
        review: 'Warning: Editing this field requires admin approval and may temporarily suspend account.'
      }
    },
    documents: {
      title: 'Documents & Licenses',
      subtitle: 'Manage official documents and update expired licenses',
      table: {
        doc: 'Document',
        status: 'Status',
        expiry: 'Expiry Date',
        actions: 'Actions'
      },
      status: {
        approved: 'Approved',
        pending: 'Under Review',
        rejected: 'Rejected',
        expired: 'Expired'
      },
      actions: {
        update: 'Update',
        view: 'View'
      },
      uploadModal: {
        title: 'Update Document',
        desc: 'Please upload a clear and recent copy of the document',
        confirm: 'Submit for Review'
      }
    },
    notifications: {
      title: 'Notifications',
      markAllRead: 'Mark all as read',
      empty: 'No new notifications',
      newOffer: 'New Offer',
      offerAccepted: 'Offer Accepted',
      paymentConfirmed: 'Payment Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      rateRequest: 'Rate Request',
      disputeUpdate: 'Dispute Update',
      docExpiry: 'Alert: Document Expiring Soon',
      adminAlert: 'Admin Alert'
    }
  }
};
