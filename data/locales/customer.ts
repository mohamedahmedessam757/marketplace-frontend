
export const customer = {
  ar: {
    menu: {
      home: 'الرئيسية',
      orders: 'طلباتي',
      create: 'طلب جديد',
      chats: 'المحادثات',
      profile: 'الملف الشخصي',
      resolution: 'المرتجعات والنزاعات',
      infoCenter: 'مركز المعلومات',
      logout: 'تسجيل الخروج',
      notifications: 'الإشعارات',
      settings: 'الإعدادات',
      shipments: 'الشحنات',
      shippingCart: 'سلة الشحن',
      billing: 'الدفع والفواتير',
      preferences: 'التفضيلات والإشعارات',
      loyalty: 'التقييم والولاء',
      support: 'الدعم الفني',
      returns: 'المرتجعات'
    },
    common: {
      loading: 'جاري التحميل...',
      select: 'اختر...',
      expired: 'منتهية',
      notFound: 'غير موجود',
      redeem: 'استبدال',
      history: 'السجل',
      earned: 'المكتسبة',
      rewards: 'المكافآت',
      reviews: 'تقييمات'
    },
    shipments: {
      subtitle: 'تتبع جميع شحناتك الحالية والسابقة',
      noShipments: 'لا توجد شحنات',
      routeDetails: 'تفاصيل المسار',
      items: 'المحتويات',
      quantity: 'الكمية'
    },
    actions: {
      viewTracking: 'تتبع الشحنة',
      hideTracking: 'إخفاء التتبع'
    },
    shippingCart: {
      subtitle: 'تجميع العناصر المحتجزة في شحنة واحدة لتوفير التكاليف',
      itemsInCart: 'عناصر في السلة',
      summary: 'ملخص الطلب',
      subtotal: 'المجموع الفرعي',
      shippingEst: 'تكلفة الشحن التقديرة',
      calculatedNext: 'تُحسب في الخطوة التالية',
      total: 'الإجمالي',
      proceed: 'المتابعة للدفع',
      timerNote: 'يتم حجز العناصر المضافة للسلة لمدة 48 ساعة. يرجى إتمام الشراء قبل انتهاء الوقت.',
      empty: 'سلة الشحن فارغة',
      emptyDesc: 'ستظهر العناصر هنا بعد قبول عرض من أحد البائعين. تصفح طلباتك واقبل العروض لإضافة عناصر إلى سلتك.',
      store: 'المتجر',
      modes: {
        title: 'نوع الشحن',
        faster: 'أسرع',
        cheaper: 'أوفر',
        fasterDesc: 'شحن العناصر فور وصولها (أسرع)',
        cheaperDesc: 'تجميع العناصر في صندوق واحد (صديق للبيئة وأوفر)'
      }
    },
    dashboardHome: {
      stats: {
        active: 'الطلبات النشطة',
        completed: 'المكتملة',
        spent: 'إجمالي المصروفات'
      },
      headers: {
        liveTracking: 'متابعة مباشرة',
        viewAll: 'عرض الكل',
        recentActivity: 'آخر الأنشطة'
      },
      empty: {
        noActive: 'لا توجد طلبات نشطة حالياً',
        noActiveDesc: 'جميع طلباتك السابقة مكتملة. هل تود إنشاء طلب جديد؟',
        noHistory: 'لا يوجد سجل سابق'
      },
      actions: {
        viewDetails: 'عرض التفاصيل الكاملة',
        viewHistory: 'عرض كل السجل'
      }
    },
    headers: {
      welcome: 'مرحباً،',
      recentOrders: 'آخر الطلبات',
      liveTracking: 'متابعة مباشرة',
      needPart: 'هل تحتاج لقطعة غيار جديدة؟',
      needPartDesc: 'أنشئ طلبك الآن وسنقوم بالبحث عن أفضل العروض لك من شبكة موردينا المعتمدين حول العالم.',
      noOrders: 'لا توجد طلبات نشطة حالياً',
      noOrdersDesc: 'جميع طلباتك السابقة مكتملة. هل تود إنشاء طلب جديد؟',
      noHistory: 'لا يوجد سجل سابق',
      viewFullHistory: 'عرض كل السجل'
    },
    createOrder: {
      title: 'إنشاء طلب جديد',
      subtitle: 'قم بتعبئة التفاصيل التالية للحصول على أفضل العروض',
      partSubtitle: 'أدخل تفاصيل القطع المطلوبة بدقة',
      preferencesSubtitle: 'حدد تفضيلاتك للقطعة',
      steps: {
        vehicle: 'السيارة',
        part: 'القطعة',
        preferences: 'التفضيلات',
        review: 'المراجعة'
      },
      vehicle: {
        make: 'نوع السيارة',
        model: 'الموديل',
        year: 'سنة الصنع',
        vin: 'رقم الهيكل (VIN)',
        vinPlaceholder: 'أدخل الـ 17 رقم',
        selectMake: 'اختر الشركة المصنعة',
        selectModel: 'اختر الموديل',
        selectYear: 'اختر السنة',
        tooltip: 'يمكنك العثور على رقم الهيكل في استمارة السيارة أو على الزجاج الأمامي.'
      },
      part: {
        name: 'اسم القطعة المطلوبة',
        namePlaceholder: 'مثال: صدام أمامي، قير، مكينة...',
        desc: 'وصف تفصيلي',
        descPlaceholder: 'اذكر أي تفاصيل إضافية تساعد في تحديد القطعة بدقة... (إجباري)',
        images: 'صور القطعة',
        upload: 'رفع صورة'
      },
      prefs: {
        condition: 'حالة القطعة المفضلة',
        new: 'جديد / شبه جديد',
        newDesc: 'قطع بكرتونها أو من سيارات ممشى قليل جداً.',
        used: 'مستعمل نظيف',
        usedDesc: 'قطع مستعملة بحالة ممتازة ومفحوصة.',
        warranty: 'طلب ضمان ممتد',
        warrantyDesc: 'تفضيل العروض التي تشمل ضمان لمدة 3 أشهر على الأقل.'
      },
      review: {
        alert: 'يرجى مراجعة تفاصيل طلبك بدقة قبل الإرسال لضمان وصول العروض المناسبة.',
        vehicleInfo: 'معلومات السيارة',
        partDetails: 'تفاصيل القطعة',
        confirm: 'تأكيد وإرسال الطلب'
      },
      successAlert: 'طلب جديد في السوق',
      next: 'التالي',
      back: 'السابق'
    },
    orders: {
      manageTitle: 'إدارة ومتابعة طلباتك السابقة والحالية',
      tabs: {
        all: 'الكل',
        active: 'نشطة',
        completed: 'مكتملة',
        cancelled: 'ملغاة'
      },
      notFound: 'لا توجد طلبات',
      notFoundDesc: 'لا توجد طلبات تطابق معايير البحث',
      newOffers: 'عروض جديدة',
      status: 'حالة الطلب',
      viewFull: 'عرض التفاصيل الكاملة',
      simulateShip: 'محاكاة الشحن',
      simulateDeliver: 'محاكاة التوصيل',
      backToList: 'العودة للقائمة',
      orderId: 'طلب #',
      requestDate: 'تاريخ الطلب',
      searching: 'جاري البحث عن موردين',
      searchingDesc: 'طلبك الآن متاح لدى شبكة الموردين. ستصلك العروض فور توفرها.',
      receivedOffers: 'العروض المستلمة',
      noOffers: 'لا توجد عروض حتى الآن',
      vehicleDetails: 'تفاصيل المركبة',
      partName: 'اسم القطعة',
      vehicle: 'السيارة',
      supportTitle: 'الدعم والمساعدة',
      supportDesc: 'تواصل معنا في حال وجود مشكلة',
      hideTracking: 'إخفاء التفاصيل',
      viewTracking: 'تتبع الشحنة بالتفصيل',
      searchPlaceholder: 'بحث...'
    },
    offers: {
      incVat: 'السعر شامل الضريبة',
      accept: 'قبول',
      finalPrice: 'السعر النهائي',
      shippingIncluded: 'شامل الشحن',
      offerNotes: 'ملاحظات المتجر',
      conditions: {
        new: 'جديد',
        used: 'مستعمل',
        used_clean: 'مستعمل - نظيف',
        remanufactured: 'مجدد'
      },
      warranties: {
        yes: 'ضمان متوفر',
        no: 'بدون ضمان'
      },
      delivery: {
        d1_3: '1-3 أيام',
        d3_7: '3-7 أيام',
        d7_14: '7-14 يوم'
      },
      labels: {
        condition: 'الحالة',
        type: 'النوع',
        warranty: 'الضمان',
        delivery: 'مدة التواصيل',
        weight: 'الوزن التقريبي',
        notes: 'ملاحظات التاجر',
        unitPrice: 'سعر القطعة'
      },
      partTypes: {
        original: 'أصلي',
        commercial: 'تجاري',
        aftermarket: 'تجاري'
      },
      units: {
        kg: 'كجم'
      }
    },
    chat: {
      title: 'المحادثات',
      noChats: 'لا توجد محادثات نشطة',
      typeMessage: 'اكتب رسالتك هنا...',
      offerReceived: 'عرض جديد بقيمة',
      acceptOffer: 'قبول العرض والانتقال للدفع',
      orderContext: 'سياق الطلب'
    },
    checkout: {
      title: 'إتمام الطلب',
      steps: { address: 'العنوان', summary: 'الفاتورة', payment: 'الدفع', confirm: 'التأكيد' },
      address: { name: 'الاسم الكامل', phone: 'رقم الجوال', city: 'المدينة', address: 'تفاصيل العنوان' },
      summary: { item: 'قيمة القطعة', vat: 'ضريبة القيمة المضافة', shipping: 'رسوم الشحن', total: 'الإجمالي', pay: 'دفع' },
      payment: { title: 'بيانات البطاقة', holder: 'اسم حامل البطاقة', card: 'رقم البطاقة', expiry: 'تاريخ الانتهاء', cvv: 'رمز الأمان', secure: 'دفع آمن ومحمي بواسطة Stripe' },
      success: { title: 'تم الدفع بنجاح', desc: 'تم استلام طلبك وجاري العمل على تجهيزه.', back: 'العودة للطلبات' }
    },
    profile: {
      tabs: { info: 'البيانات الشخصية', security: 'الأمان والجلسات', wallet: 'المحفظة', settings: 'الإعدادات', addresses: 'العناوين', reviews: 'التقييمات' },
      info: { name: 'الاسم الكامل', email: 'البريد الإلكتروني', phone: 'رقم الجوال', save: 'حفظ التغييرات' },
      accountType: 'حساب عميل',
      security: {
        current: 'كلمة المرور الحالية',
        new: 'كلمة المرور الجديدة',
        confirm: 'تأكيد كلمة المرور',
        update: 'تحديث كلمة المرور',
        activeSessions: 'الجلسات النشطة',
        thisDevice: 'هذا الجهاز',
        terminate: 'إنهاء',
        terminateAll: 'تسجيل الخروج من جميع الأجهزة',
        secureNote: 'يتم تشفير جميع كلمات المرور وحماية حسابك عبر بروتوكولات أمان متقدمة.'
      },
      wallet: { myCards: 'بطاقاتي', addNew: 'إضافة بطاقة', savedAddresses: 'العناوين المحفوظة' },
      settings: {
        lang: 'اللغة',
        notif: 'الإشعارات',
        notifDesc: 'استلام تحديثات حول حالة طلباتك',
        delete: 'حذف الحساب',
        danger: 'منطقة الخطر',
        global: 'التفضيلات العامة',
        currency: 'العملة',
        theme: 'المظهر',
        appearance: 'المظهر الخارجي',
        langDesc: 'اختر لغتك المفضلة',
        currencyDesc: 'عرض الأسعار بـ',
        themeDesc: 'اختر وضع العرض',
        dangerDesc: 'حذف الحساب والبيانات نهائياً',
        save: 'حفظ الإعدادات',
        notificationTypes: {
          email: 'إشعارات البريد الإلكتروني',
          emailDesc: 'استلام تحديثات حول طلباتك بشكل منظم.',
          push: 'إشعارات التنبيه (Push)',
          pushDesc: 'تنبيهات فورية على جهازك.',
          offers: 'عروض تسويقية',
          offersDesc: 'خصومات خاصة وعروض الشركاء.',
          sms: 'رسائل نصية (SMS)',
          smsDesc: 'تحديثات الأمان والتوصيل الهامة.'
        }
      },
      addresses: { title: 'العناوين المحفوظة', add: 'إضافة عنوان جديد', default: 'الافتراضي', setDefault: 'تعيين كافتراضي', noAddresses: 'لا توجد عناوين محفوظة', save: 'حفظ العنوان' },
      reviews: { title: 'تقييماتي', noReviews: 'لم تقم بكتابة أي تقييم بعد' },
      loyalty: {
        title: 'نقاط الولاء',
        catalog: 'كتالوج المكافآت',
        redeem: 'استبدال',
        insufficient: 'رصيد غير كاف',
        success: 'تم الاستبدال بنجاح'
      }
    },
    tracking: {
      title: 'تتبع الشحنة',
      estimated: 'التاريخ المتوقع',
      carrier: 'شركة الشحن',
      trackingNo: 'رقم البوليصة',
      viewMap: 'عرض الموقع المباشر',
      courierWeb: 'موقع شركة الشحن',
      steps: {
        received: 'تم الاستلام من المتجر',
        transit: 'في الطريق',
        distribution: 'وصلت لمركز التوزيع',
        out: 'خرجت للتوصيل',
        delivered: 'تم التسليم',
        cancelled: 'ملغى'
      }
    },
    reviews: {
      writeTitle: 'قيم تجربتك',
      rating: 'التقييم',
      comment: 'اكتب تعليقك هنا...',
      placeholder: 'صف تجربتك مع المنتج والتاجر...',
      submit: 'إرسال التقييم',
      success: 'تم إرسال التقييم بنجاح',
      published: 'منشور',
      pending: 'قيد المراجعة'
    },
    resolution: {
      billing: 'الفواتير',
      loyalty: 'نقاط الولاء',
      return: 'طلب إرجاع',
      dispute: 'نزاع',
      subtitle: 'إدارة النزاعات وطلبات الإرجاع',
      returnPolicy: 'يمكنك طلب الإرجاع خلال 48 ساعة من الاستلام في حال وجود عيب مصنعي أو عدم مطابقة.',
      disputePolicy: 'يتم تجميد المبلغ فوراً عند فتح النزاع. يرجى التواصل مع المتجر أولاً لمحاولة حل المشكلة ودياً.',
      reasons: {
        not_matching: 'القطعة غير مطابقة للوصف',
        defective: 'القطعة تالفة أو معيبة',
        delayed: 'تأخر الشحن عن الموعد المحدد',
        wrong_item: 'استلام منتج خاطئ'
      },
      guidelines: {
        title: 'إرشادات التغليف',
        policy: 'سياسة الإرجاع',
        packaging: 'تعليمات الشحن',
        steps: [
          'استخدم العبوة الأصلية إن أمكن لضمان حماية القطعة.',
          'تأكد من أن القطعة نظيفة وخالية من السوائل (زيوت، وقود).',
          'استخدم حماية كافية (فقاعات) للأجزاء القابلة للكسر.',
          'أغلق الصندوق بإحكام باستخدام شريط لاصق قوي.'
        ],
        highlights: [
          'يتم قبول المرتجعات خلال 7 أيام من الاستلام في حال وجود عيب.',
          'يجب أن تكون القطعة بنفس الحالة المستلمة (العلامات كما هي).',
          'قد تطبق رسوم شحن للإرجاع في حال عدم وجود عيب بالقطعة.',
          'تتم معالجة الاسترداد لنفس وسيلة الدفع أو المحفظة خلال 5 أيام.'
        ]
      },
      form: {
        reason: 'سبب الطلب',
        desc: 'وصف المشكلة بالتفصيل',
        evidence: 'الأدلة (صور/فيديو)',
        submitReturn: 'إرسال طلب الإرجاع',
        submitDispute: 'فتح نزاع رسمي',
        upload: 'رفع ملفات'
      },
      alerts: {
        freeze: 'تنبيه: سيتم تجميد المبلغ وحجزه لدى المنصة لحين حل النزاع نهائياً.',
        success: 'تم فتح الطلب بنجاح. سنقوم بمراجعة طلبك وإبلاغك بالتحديثات.'
      }
    },
    returns: {
      subtitle: 'إدارة طلبات الإرجاع والمنازعات',
      tabs: {
        activeReturns: 'المرتجعات النشطة',
        disputes: 'النزاعات',
        guidelines: 'الإرشادات'
      },
      noReturns: 'لا توجد طلبات إرجاع',
      noReturnsDesc: 'لم تقم بتقديم أي طلب إرجاع حالياً',
      noDisputes: 'لا توجد نزاعات',
      noDisputesDesc: 'سجلك نظيف خالي من النزاعات'
    },
    billing: {
      title: 'الدفع والفواتير',
      subtitle: 'إدارة فواتير الطلبات والمدفوعات',
      tabs: {
        unpaid: 'فواتير غير مدفوعة',
        history: 'سجل المدفوعات',
        methods: 'طرق الدفع'
      },
      wallet: 'المحفظة',
      invoice: {
        id: 'رقم الفاتورة',
        date: 'تاريخ الفاتورة',
        amount: 'المبلغ الإجمالي',
        status: 'حالة الدفع',
        view: 'عرض الفاتورة',
        pay: 'دفع الآن',
        details: 'تفاصيل الفاتورة',
        download: 'تحميل PDF',
        print: 'طباعة',
        billTo: 'فاتورة إلى',
        shipTo: 'الشحن إلى',
        item: 'المنتج',
        qty: 'الكمية',
        price: 'السعر',
        total: 'الإجمالي',
        vat: 'الضريبة (15%)',
        subtotal: 'المجموع الفعلي',
        shipping: 'الشحن',
        grandTotal: 'المبلغ النهائي',
        sender: 'المرسل',
        receiver: 'المستلم',
        note: 'ملاحظة'
      },
      cardForm: {
        holder: 'اسم حامل البطاقة',
        number: 'رقم البطاقة',
        expiry: 'تاريخ الانتهاء (MM/YY)',
        cvc: 'رمز الأمان (CVC)',
        save: 'حفظ البطاقة',
        cancel: 'إلغاء',
        makeDefault: 'تعيين كافتراضي',
        default: 'افتراضي',
        expires: 'تنتهي في',
        noCards: 'لا توجد بطاقات محفوظة'
      },
      empty: {
        unpaid: 'لا توجد فواتير مستحقة الدفع',
        history: 'لا يوجد سجل مدفوعات سابق'
      }
    },
    support: {
      subtitle: 'مركز المساعدة والدعم الفني',
      createTicket: 'فتح تذكرة جديدة',
      newTicketTitle: 'تفاصيل التذكرة',
      subject: 'الموضوع',
      message: 'الرسالة',
      myTickets: 'تذاكري',
      noTickets: 'لا توجد تذاكر دعم سابقة',
      faq: {
        q1: 'كيف يمكنني تتبع طلبي؟',
        a1: 'يمكنك تتبع طلبك من صفحة "الشحنات" أو "طلباتي" بالنقر على زر التتبع.',
        q2: 'متى يمكنني طلب استرجاع المبلغ؟',
        a2: 'يمكنك طلب الاسترجاع إذا لم يتم شحن الطلب، أو خلال 48 ساعة من الاستلام في حال وجود عيب.',
        q3: 'كيف أتواصل مع البائع؟',
        a3: 'يمكنك استخدام خيار المحادثة المباشرة في صفحة تفاصيل الطلب.'
      },
      form: {
        priority: 'الأولوية',
        low: 'منخفضة',
        medium: 'متوسطة',
        high: 'عالية',
        summaryPlaceholder: 'ملخص مختصر للمشكلة',
        descPlaceholder: 'يرجى وصف مشكلتك بالتفصيل...',
        upload: 'اضغط هنا لرفع صور أو ملفات ذات صلة',
        error: 'فشل إرسال التذكرة. يرجى المحاولة مرة أخرى.',
        submitting: 'جاري الإرسال...'
      }
    },
    infoCenter: {
      title: 'مركز المعلومات',
      subtitle: 'كل ما تحتاج معرفته عن منصة إي تشليح',
      tabs: { about: 'من نحن', privacy: 'الخصوصية', terms: 'الشروط', faq: 'الأسئلة الشائعة', contact: 'تواصل معنا' }
    },
    threeDS: {
      title: 'التحقق البنكي 3D Secure',
      subtitle: 'مصادقة دفع آمنة',
      amount: 'المبلغ',
      date: 'التاريخ',
      card: 'البطاقة',
      otpLabel: 'رمز التحقق (OTP) المرسل لهاتفك',
      resend: 'إعادة إرسال الرمز',
      verify: 'تحقق وإتمام الدفع',
      cancel: 'إلغاء'
    },
    status: {
      completed: 'مكتمل',
      pending: 'قيد الانتظار',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل'
    },
    timers: {
      offers_expires: 'ينتهي استقبال العروض خلال',
      payment_expires: 'تنتهي مهلة الدفع خلال',
      return_window: 'نافذة الإرجاع تنتهي خلال'
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
      adminAlert: 'تنبيه إداري'
    }
  },
  en: {
    menu: {
      home: 'Home',
      orders: 'My Orders',
      create: 'New Order',
      chats: 'Chats',
      profile: 'Profile',
      resolution: 'Returns & Disputes',
      infoCenter: 'Info Center',
      logout: 'Logout',
      notifications: 'Notifications',
      settings: 'Settings',
      shipments: 'Shipments',
      shippingCart: 'Shipping Cart',
      billing: 'Billing & Invoices',
      preferences: 'Preferences',
      loyalty: 'Loyalty & Rewards',
      support: 'Support Center',
      returns: 'Returns'
    },
    common: {
      loading: 'Loading...',
      select: 'Select...',
      expired: 'Expired',
      notFound: 'Not Found',
      redeem: 'Redeem',
      history: 'History',
      earned: 'Earned',
      rewards: 'Rewards',
      reviews: 'Reviews'
    },
    shipments: {
      subtitle: 'Track all your incoming and past shipments',
      noShipments: 'No shipments found',
      routeDetails: 'Route Details',
      items: 'Items',
      quantity: 'Qty'
    },
    actions: {
      viewTracking: 'Track Shipment',
      hideTracking: 'Hide Tracking'
    },
    shippingCart: {
      subtitle: 'Consolidate your held items into one shipment to save costs',
      itemsInCart: 'Items in Cart',
      summary: 'Order Summary',
      subtotal: 'Subtotal',
      shippingEst: 'Shipping estimate',
      calculatedNext: 'Calculated next step',
      total: 'Total',
      proceed: 'Proceed to Checkout',
      timerNote: 'Items added to cart are reserved for 48 hours. Please complete purchase before timer expires.',
      empty: 'Your shipping cart is empty',
      emptyDesc: 'Items will appear here after accepting an offer from a vendor. Browse your orders and accept offers to add items to your cart.',
      store: 'Store',
      modes: {
        title: 'Shipping Mode',
        faster: 'Faster',
        cheaper: 'Cheaper',
        fasterDesc: 'Items shipped as they arrive (Faster)',
        cheaperDesc: 'Items shipped together in one box (Ecofriendly & Cheaper)'
      }
    },
    dashboardHome: {
      stats: {
        active: 'Active Orders',
        completed: 'Completed',
        spent: 'Total Spent'
      },
      headers: {
        liveTracking: 'Live Tracking',
        viewAll: 'View All',
        recentActivity: 'Recent Activity'
      },
      empty: {
        noActive: 'No Active Orders',
        noActiveDesc: 'All your previous orders are completed. Want to create a new one?',
        noHistory: 'No history found'
      },
      actions: {
        viewDetails: 'View Full Details',
        viewHistory: 'View Full History'
      }
    },
    headers: {
      welcome: 'Welcome,',
      recentOrders: 'Recent Orders',
      liveTracking: 'Live Tracking',
      needPart: 'Need a new spare part?',
      needPartDesc: 'Create your request now and we will search for the best offers from our certified global suppliers.',
      noOrders: 'No Active Orders',
      noOrdersDesc: 'All your previous orders are completed. Want to create a new one?',
      noHistory: 'No history found',
      viewFullHistory: 'View Full History'
    },
    createOrder: {
      title: 'Create New Order',
      subtitle: 'Fill in the details below to get the best offers',
      partSubtitle: 'Enter details for the requested parts',
      preferencesSubtitle: 'Select your preferences for the part',
      steps: {
        vehicle: 'Vehicle',
        part: 'Part',
        preferences: 'Preferences',
        review: 'Review'
      },
      vehicle: {
        make: 'Car Make',
        model: 'Car Model',
        year: 'Year',
        vin: 'VIN Number',
        vinPlaceholder: 'Enter 17 characters',
        selectMake: 'Select Make',
        selectModel: 'Select Model',
        selectYear: 'Select Year',
        tooltip: 'You can find the VIN on your registration card or dashboard.'
      },
      part: {
        name: 'Part Name',
        namePlaceholder: 'e.g., Front Bumper, Gearbox...',
        desc: 'Detailed Description',
        descPlaceholder: 'Mention any additional details to identify the part... (Required)',
        images: 'Part Images',
        upload: 'Upload'
      },
      prefs: {
        condition: 'Preferred Condition',
        new: 'New / Like New',
        newDesc: 'Parts in box or from very low mileage cars.',
        used: 'Used - Clean',
        usedDesc: 'Used parts in excellent tested condition.',
        warranty: 'Extended Warranty Request',
        warrantyDesc: 'Prefer offers that include at least 3 months warranty.'
      },
      review: {
        alert: 'Please review your order details carefully before submitting to ensure accurate offers.',
        vehicleInfo: 'Vehicle Information',
        partDetails: 'Part Details',
        confirm: 'Confirm & Submit Order'
      },
      successAlert: 'New Market Request',
      next: 'Next',
      back: 'Back'
    },
    orders: {
      manageTitle: 'Manage and track your current and past orders',
      tabs: {
        all: 'All',
        active: 'Active',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      notFound: 'No Orders Found',
      notFoundDesc: 'No orders match your search criteria',
      newOffers: 'New Offers',
      status: 'Status',
      viewFull: 'View Full Details',
      simulateShip: 'Simulate Ship',
      simulateDeliver: 'Simulate Delivery',
      backToList: 'Back to List',
      orderId: 'Order #',
      requestDate: 'Request Date',
      searching: 'Searching for Suppliers',
      searchingDesc: 'Your request is now live. Offers will appear here as soon as they arrive.',
      receivedOffers: 'Received Offers',
      noOffers: 'No offers yet',
      vehicleDetails: 'Vehicle Details',
      partName: 'Part Name',
      vehicle: 'Vehicle',
      supportTitle: 'Support & Help',
      supportDesc: 'Contact us if you have any issues',
      hideTracking: 'Hide Tracking Details',
      viewTracking: 'View Full Tracking',
      searchPlaceholder: 'Search...'
    },
    offers: {
      incVat: 'Inc. VAT',
      accept: 'Accept',
      finalPrice: 'Final Price',
      shippingIncluded: 'Shipping Included',
      offerNotes: 'Vendor Notes',
      conditions: {
        new: 'New',
        used: 'Used',
        used_clean: 'Used - Clean',
        remanufactured: 'Remanufactured'
      },
      warranties: {
        yes: 'Warranty Available',
        no: 'No Warranty'
      },
      delivery: {
        d1_3: '1-3 Days',
        d3_7: '3-7 Days',
        d7_14: '7-14 Days'
      },
      labels: {
        condition: 'Condition',
        type: 'Type',
        warranty: 'Warranty',
        delivery: 'Delivery',
        weight: 'Weight',
        notes: 'Vendor Notes',
        unitPrice: 'Part Price'
      },
      partTypes: {
        original: 'Original',
        commercial: 'Aftermarket',
        aftermarket: 'Aftermarket'
      },
      units: {
        kg: 'Kg'
      }
    },
    chat: {
      title: 'Chats',
      noChats: 'No active chats',
      typeMessage: 'Type your message...',
      offerReceived: 'New offer received:',
      acceptOffer: 'Accept Offer & Pay',
      orderContext: 'Order Context'
    },
    checkout: {
      title: 'Checkout',
      steps: { address: 'Address', summary: 'Invoice', payment: 'Payment', confirm: 'Confirm' },
      address: { name: 'Full Name', phone: 'Phone Number', city: 'City', address: 'Address Details' },
      summary: { item: 'Part Value', vat: 'VAT', shipping: 'Shipping', total: 'Total', pay: 'Pay' },
      payment: { title: 'Card Details', holder: 'Cardholder Name', card: 'Card Number', expiry: 'Expiry Date', cvv: 'CVV', secure: 'Secure Payment by Stripe' },
      success: { title: 'Payment Successful', desc: 'Order received and being processed.', back: 'Back to Orders' }
    },
    profile: {
      tabs: { info: 'Personal Info', security: 'Security & Sessions', wallet: 'Wallet', settings: 'Settings', addresses: 'Addresses', reviews: 'Reviews' },
      info: { name: 'Full Name', email: 'Email', phone: 'Phone', save: 'Save Changes' },
      accountType: 'Customer Account',
      security: {
        current: 'Current Password',
        new: 'New Password',
        confirm: 'Confirm Password',
        update: 'Update Password',
        activeSessions: 'Active Sessions',
        thisDevice: 'This Device',
        terminate: 'Terminate',
        terminateAll: 'Log out from all devices',
        secureNote: 'All passwords encrypted and account protected with advanced security protocols.'
      },
      wallet: { myCards: 'My Cards', addNew: 'Add New Card', savedAddresses: 'Saved Addresses' },
      settings: {
        lang: 'Language',
        notif: 'Notifications',
        notifDesc: 'Receive updates about your orders',
        delete: 'Delete Account',
        danger: 'Danger Zone',
        global: 'Global Preferences',
        currency: 'Currency',
        theme: 'Appearence',
        appearance: 'Appearance',
        langDesc: 'Select your preferred language',
        currencyDesc: 'Display prices in',
        themeDesc: 'Choose theme mode',
        dangerDesc: 'Permanently remove your account and data',
        save: 'Save Settings',
        notificationTypes: {
          email: 'Email Notifications',
          emailDesc: 'Receive updates about your orders properly',
          push: 'Push Notifications',
          pushDesc: 'Get real-time alerts on your device',
          offers: 'Marketing Offers',
          offersDesc: 'Receive special discounts and partner offers',
          sms: 'SMS Alerts',
          smsDesc: 'Important security and delivery updates via SMS'
        }
      },
      addresses: { title: 'Saved Addresses', add: 'Add New Address', default: 'Default', setDefault: 'Set Default', noAddresses: 'No saved addresses', save: 'Save Address' },
      reviews: { title: 'My Reviews', noReviews: 'You haven\'t written any reviews yet' },
      loyalty: {
        title: 'Loyalty Points',
        catalog: 'Rewards Catalog',
        redeem: 'Redeem',
        insufficient: 'Insufficient Balance',
        success: 'Redeemed Successfully'
      }
    },
    tracking: {
      title: 'Track Shipment',
      estimated: 'Estimated Date',
      carrier: 'Carrier',
      trackingNo: 'Waybill No',
      viewMap: 'View Live Map',
      courierWeb: 'Courier Website',
      steps: {
        received: 'Received from Store',
        transit: 'In Transit',
        distribution: 'Arrived at Distribution Center',
        out: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      }
    },
    reviews: {
      writeTitle: 'Rate Experience',
      rating: 'Rating',
      comment: 'Write your comment...',
      placeholder: 'Describe your experience with the product and merchant...',
      submit: 'Submit Review',
      success: 'Review submitted successfully',
      published: 'Published',
      pending: 'Pending Review'
    },
    resolution: {
      billing: 'Billing',
      loyalty: 'Loyalty Points',
      return: 'Return Request',
      dispute: 'Dispute',
      subtitle: 'Manage disputes and returns',
      returnPolicy: 'You can request a return within 48 hours of delivery for defects or mismatch.',
      disputePolicy: 'Funds are frozen immediately upon opening a dispute. Please contact merchant first.',
      reasons: {
        not_matching: 'Part not matching description',
        defective: 'Part defective or damaged',
        delayed: 'Shipping delayed',
        wrong_item: 'Wrong item received'
      },
      guidelines: {
        title: 'Packaging Guidelines',
        policy: 'Return Policy',
        packaging: 'Shipping Instructions',
        steps: [
          'Use the original packaging if possible to ensure part protection.',
          'Ensure the part is clean and free of fluids (oil, fuel).',
          'Use adequate cushioning (bubble wrap) for fragile components.',
          'Seal the box securely with heavy-duty tape.'
        ],
        highlights: [
          'Returns accepted within 7 days of delivery for defective items.',
          'Item must be in the same condition as received (markings intact).',
          'Return shipping fees may apply for non-defective returns.',
          'Refunds are processed to the original payment method or wallet within 5 days.'
        ]
      },
      form: {
        reason: 'Reason',
        desc: 'Detailed Description',
        evidence: 'Evidence (Photos/Video)',
        submitReturn: 'Submit Return Request',
        submitDispute: 'Open Official Dispute',
        upload: 'Upload Files'
      },
      alerts: {
        freeze: 'Warning: Amount will be frozen and held by platform until dispute is resolved.',
        success: 'Request opened successfully. We will review and update you.'
      }
    },
    returns: {
      subtitle: 'Manage returns and disputes',
      tabs: {
        activeReturns: 'Active Returns',
        disputes: 'Disputes',
        guidelines: 'Guidelines'
      },
      noReturns: 'No active returns',
      noReturnsDesc: 'You have not requested any returns',
      noDisputes: 'No disputes',
      noDisputesDesc: 'Your record is clean'
    },
    billing: {
      title: 'Billing & Invoices',
      subtitle: 'Manage order invoices and payments',
      tabs: {
        unpaid: 'Unpaid Invoices',
        history: 'Payment History',
        methods: 'Payment Methods'
      },
      wallet: 'Wallet',
      invoice: {
        id: 'Invoice #',
        date: 'Invoice Date',
        amount: 'Total Amount',
        status: 'Payment Status',
        view: 'View Invoice',
        pay: 'Pay Now',
        details: 'Invoice Details',
        download: 'Download PDF',
        print: 'Print',
        billTo: 'Bill To',
        shipTo: 'Ship To',
        item: 'Item',
        qty: 'Qty',
        price: 'Price',
        total: 'Total',
        vat: 'VAT (15%)',
        subtotal: 'Subtotal',
        shipping: 'Shipping',
        grandTotal: 'Grand Total',
        sender: 'Sender',
        receiver: 'Receiver',
        note: 'Note'
      },
      cardForm: {
        holder: 'Card Holder Name',
        number: 'Card Number',
        expiry: 'Expiry (MM/YY)',
        cvc: 'CVC',
        save: 'Save Card',
        cancel: 'Cancel',
        makeDefault: 'Make Default',
        default: 'Default',
        expires: 'Expires',
        noCards: 'No saved cards'
      },
      empty: {
        unpaid: 'No unpaid invoices',
        history: 'No payment history found'
      }
    },
    support: {
      subtitle: 'Help Center & Support',
      createTicket: 'Open New Ticket',
      newTicketTitle: 'Ticket Details',
      subject: 'Subject',
      message: 'Message',
      myTickets: 'My Tickets',
      noTickets: 'No support tickets found',
      faq: {
        q1: 'How can I track my order?',
        a1: 'You can track your order from "Shipments" or "My Orders" page by clicking track button.',
        q2: 'When can I request a refund?',
        a2: 'You can request refund if not shipped, or within 48h of delivery if defective.',
        q3: 'How to contact seller?',
        a3: 'Use the live chat option in the order details page.'
      },
      form: {
        priority: 'Priority',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        summaryPlaceholder: 'Brief summary of the issue',
        descPlaceholder: 'Please describe your issue in detail...',
        upload: 'Click to upload screenshots or relevant files',
        error: 'Failed to create ticket. Please try again.',
        submitting: 'Submitting...'
      }
    },
    infoCenter: {
      title: 'Info Center',
      subtitle: 'Everything you need to know about E-Tashleh',
      tabs: { about: 'About Us', privacy: 'Privacy', terms: 'Terms', faq: 'FAQ', contact: 'Contact Us' }
    },
    threeDS: {
      title: '3D Secure Verification',
      subtitle: 'Secure Payment Authentication',
      amount: 'Amount',
      date: 'Date',
      card: 'Card',
      otpLabel: 'OTP Code sent to mobile',
      resend: 'Resend Code',
      verify: 'Verify & Pay',
      cancel: 'Cancel'
    },
    status: {
      completed: 'Completed',
      pending: 'Pending',
      shipped: 'Shipped',
      delivered: 'Delivered'
    },
    timers: {
      offers_expires: 'Offers expire in',
      payment_expires: 'Payment expires in',
      return_window: 'Return window closes in'
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
      disputeUpdate: 'Dispute Update'
    }
  }
};
