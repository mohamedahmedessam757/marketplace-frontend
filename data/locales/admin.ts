
export const admin = {
  ar: {
    dashboard: 'لوحة القيادة',
    users: 'إدارة المتاجر',
    customers: 'العملاء',
    reviews: 'التقييمات',
    orders: 'الطلبات الواردة',
    settings: 'إعدادات النظام',
    disputes: 'فض النزاعات',
    shipping: 'إدارة الشحن',
    auditLogs: 'سجل العمليات',
    violations: 'المخالفات والعقوبات',
    automations: {
      active: 'الأتمتة نشطة',
      stopped: 'الأتمتة متوقفة'
    },
    riskTimer: {
      sla: 'موقت SLA',
      overdue: 'تأخير بمقدار',
      hours: 'ساعة'
    },
    actions: {
      refresh: 'تحديث البيانات',
      viewReport: 'عرض التقرير',
      viewDocs: 'عرض المستندات',
      noActions: 'لا توجد إجراءات',
      move: 'نقل إلى',
      force: 'فرض حالة',
      danger: 'منطقة الخطر (فرض بالقوة)',
      superReq: 'يتطلب صلاحية Super Admin',
      forceWarningDialog: '⚠️ تحذير: أنت على وشك تجاوز قواعد النظام وفرض الحالة يدوياً.\nسيتم تسجيل هذا الإجراء في سجلات التدقيق.\n\nهل أنت متأكد؟'
    },
    security: {
      title: 'مركز الأمان والحماية',
      auditTrail: 'سجل التدقيق',
      protection: 'الحماية النشطة',
      config: 'إعدادات الأمان',
      webhookStatus: 'حالة Webhooks',
      threats: 'محاولات التهديد',
      blockedIps: 'عناوين IP المحظورة',
      encryption: 'التشفير',
      stripe: 'حماية المدفوعات (Stripe)',
      ratelimit: 'معدل الطلبات (Rate Limit)',
      mfa: 'التحقق الثنائي'
    },
    support: {
      title: 'الدعم الفني',
      tickets: 'التذاكر',
      subtitle: 'مركز المساعدة والدعم الفني',
      createTicket: 'فتح تذكرة جديدة',
      newTicketTitle: 'تفاصيل التذكرة',
      subject: 'الموضوع',
      message: 'الرسالة',
      myTickets: 'تذاكري',
      noTickets: 'لا توجد تذاكر دعم سابقة',
      noTicketsDesc: 'لم تقم بتقديم أي تذاكر دعم فني حتى الآن.',
      liveChat: 'المحادثة الفورية',
      liveChatDesc: 'تحدث مع ممثل الدعم الفني الآن'
    },
    settingsTabs: {
      general: 'عام',
      financial: 'المالية',
      logistics: 'اللوجستيات',
      content: 'المحتوى'
    },
    financials: {
      title: 'المالية والعمولات',
      commission: 'نسبة عمولة المنصة',
      updateCommission: 'تحديث النسبة',
      logs: 'سجل العمليات المالية'
    },
    welcome: 'مركز القيادة',
    welcomeSub: 'نظرة شاملة على أداء المنصة اليوم.',
    headers: {
      recentOrders: 'آخر الطلبات'
    },
    kpi: {
      totalSales: 'إجمالي المبيعات',
      commission: 'صافي الأرباح',
      profitSub: 'أرباح المنصة',
      customers: 'العملاء المسجلين',
      stores: 'المتاجر الشريكة',
      orders: 'إجمالي الطلبات',
      disputes: 'قضايا مفتوحة'
    },
    charts: {
      salesTrend: 'اتجاه المبيعات',
      orderStatus: 'توزيع حالات الطلبات',
      topStores: 'المتاجر الأكثر مبيعاً'
    },
    alerts: {
      title: 'التنبيهات الذكية',
      noAlerts: 'النظام مستقر، لا توجد تنبيهات.',
      types: {
        no_response: 'متجر لم يرد على طلب',
        late_prep: 'تأخر في التجهيز',
        late_ship: 'شحنة متأخرة',
        license_expiry: 'اقتراب انتهاء رخصة',
        license_expired: 'رخصة منتهية',
        dispute: 'نزاع جديد',
        unpaid: 'طلب غير مدفوع'
      },
      legend: {
        completed: 'مكتمل',
        active: 'نشط',
        pending: 'معلق',
        issues: 'مشاكل'
      },
      actions: {
        viewOrder: 'عرض الطلب',
        viewStore: 'ملف المتجر',
        resolve: 'حل النزاع'
      }
    },
    stats: {
      totalRevenue: 'إجمالي الإيرادات',
      activeUsers: 'المستخدمين النشطين',
      pendingVendors: 'تجار بانتظار الاعتماد',
      openDisputes: 'نزاعات مفتوحة'
    },
    usersTable: {
      name: 'اسم المتجر',
      owner: 'المالك',
      role: 'التصنيف',
      status: 'حالة الترخيص',
      actions: 'الإجراءات',
      verify: 'تحقق المستندات',
      joined: 'تاريخ الانضمام',
      filters: {
        all: 'الكل',
        pending: 'بانتظار التحقق'
      },
      readOnly: 'حساب دعم فني: لديك صلاحية القراءة فقط.'
    },
    customersTable: {
      name: 'اسم العميل',
      contact: 'معلومات الاتصال',
      orders: 'الطلبات',
      status: 'الحالة',
      joined: 'تاريخ التسجيل',
      actions: 'إجراءات',
      ltv: 'القيمة الشرائية (LTV)',
      successRate: 'نسبة النجاح',
      adminNotes: 'ملاحظات إدارية خاصة'
    },
    customerProfile: {
      title: 'ملف العميل',
      identity: 'الهوية والمعلومات',
      activity: 'النشاط والجلسات',
      notes: 'ملاحظات إدارية',
      status: 'حالة الحساب',
      orders: 'سجل الطلبات',
      disputes: 'الشكاوى والنزاعات',
      devices: 'الأجهزة المتصلة',
      lastLogin: 'آخر دخول',
      resetPass: 'إعادة تعيين كلمة المرور',
      suspendAccount: 'تعليق الحساب'
    },
    chatOversight: {
      title: 'رقابة المحادثات',
      subtitle: 'مراقبة المحادثات النشطة بين العملاء والتجار',
      joinChat: 'انضمام للمحادثة',
      deleteChat: 'حذف المحادثة للطرفين',
      deleteMessage: 'حذف الرسالة',
      takeEvidence: 'أخذ إثبات (Snapshot)',
      evidenceCaptured: 'تم حفظ الدليل بنجاح',
      originalLanguage: 'اللغة الأصلية',
      translated: 'مترجم (AI)',
      systemIntervention: 'تدخل إداري: انضم المسؤول للمراقبة',
      banUser: 'حظر المستخدم',
      chatDeletedByAdmin: 'تم حذف هذه المحادثة بواسطة الإدارة'
    },
    reviewsControl: {
      title: 'إدارة التقييمات',
      pending: 'بانتظار المراجعة',
      published: 'منشورة',
      rejected: 'مرفوضة',
      impact: 'قواعد التأثير',
      rating: 'التقييم',
      comment: 'التعليق',
      approve: 'نشر التقييم',
      reject: 'رفض وحذف',
      rejectReason: 'سبب الرفض',
      rules: {
        add: 'إضافة قاعدة جديدة',
        edit: 'تعديل القاعدة',
        delete: 'حذف القاعدة',
        minRating: 'الحد الأدنى للتقييم',
        maxRating: 'الحد الأعلى للتقييم',
        actionType: 'نوع الإجراء',
        actionLabelAr: 'اسم الإجراء (عربي)',
        actionLabelEn: 'اسم الإجراء (إنجليزي)',
        duration: 'مدة الإيقاف (أيام)',
        status: 'الحالة',
        active: 'مفعل',
        inactive: 'غير مفعل',
        actions: {
          SUSPEND: 'إيقاف مؤقت',
          WARNING: 'تحذير',
          FEATURED: 'تاجر مميز',
          NONE: 'بدون إجراء'
        }
      }
    },
    ordersTable: {
      id: 'رقم الطلب',
      customer: 'العميل',
      merchant: 'التاجر',
      status: 'الحالة',
      force: 'تغيير الحالة',
      amount: 'المبلغ',
      date: 'التاريخ',
      parts: 'القطع (Parts)',
      financialDetails: 'التفاصيل المالية',
      exportCSV: 'تصدير CSV',
      otherParts: 'قطع أخرى',
      noMatches: 'لم يتم العثور على طلبات مطابقة',
      filterAll: 'تصفية: الكل'
    },
    orderDetails: {
      title: 'تفاصيل الطلب',
      timeline: 'سجل الأحداث',
      financials: 'الملخص المالي',
      participants: 'أطراف العملية',
      basePrice: 'سعر القطعة',
      shipping: 'رسوم الشحن',
      subtotal: 'الإجمالي الفرعي',
      commission: 'عمولة المنصة',
      total: 'الإجمالي (للعميل)',
      forceStatus: 'فرض حالة جديدة',
      forceWarning: 'تنبيه: تغيير الحالة يدوياً قد يؤثر على سير العمل.',
      customerInfo: 'بيانات العميل',
      merchantInfo: 'بيانات التاجر',
      viewInvoice: 'عرض الفاتورة',
      lastUpdated: 'آخر تحديث',
      currentStatus: 'الحالة الحالية',
      availableActions: 'الإجراءات المتاحة',
      noImage: 'لا توجد صورة',
      car: 'السيارة',
      vin: 'رقم الهيكل',
      offersCount: 'العروض',
      pendingFinancials: 'البيانات المالية بانتظار قبول العرض',
      notFound: 'الطلب غير موجود',
      editOfferModal: {
        title: 'تعديل شامل للعرض',
        unitPrice: 'سعر القطعة',
        shippingCost: 'تكلفة الشحن',
        weight: 'الوزن',
        deliveryDays: 'أيام التوصيل',
        condition: 'حالة القطعة',
        partType: 'نوع القطعة',
        hasWarranty: 'يوجد ضمان',
        warrantyDuration: 'مدة الضمان',
        merchantName: 'اسم التاجر',
        isShippingIncluded: 'الشحن مشمول في السعر',
        notes: 'ملاحظات العرض',
        save: 'حفظ التعديلات',
        cancel: 'إلغاء',
        placeholderNotes: 'أضف أي ملاحظات إضافية هنا...',
        conditions: {
          new: 'جديد',
          used_clean: 'مستعمل - نظيف',
          used_scratched: 'مستعمل - مخدوش',
          for_parts: 'للقطع (سكراب)'
        },
        partTypes: {
          oem: 'أصلي (OEM)',
          aftermarket: 'تجاري (Aftermarket)',
          commercial: 'تجاري نخب أول',
          rebuilt: 'مجدد (Rebuilt)'
        }
      },
      verificationReview: {
        modalTitle: 'اعتماد توثيق المستندات',
        employeeName: 'اسم الموظف المسؤول',
        signatureTitle: 'توقيع الموظف',
        acknowledgment: 'أقر أنا الموظف المذكور أعلاه بصحة مطابقة القطعة للمستندات المرفقة وعلى مسؤوليتي الشخصية.',
        submitReview: 'اعتماد وإرسال',
        cancel: 'إلغاء',
        signingDate: 'تاريخ التوثيق',
        details: 'تفاصيل المراجعة الإدارية',
        detailsPlaceholder: 'اكتب ملاحظات تفصيلية حول مراجعة القطعة ومطابقتها للمستندات...',
        detailsRequired: 'تفاصيل المراجعة مطلوبة للمتابعة في حالة الرفض',
        nameRequired: 'يرجى كتابة اسمك الثلاثي',
        signatureRequired: 'يرجى التوقيع للمتابعة',
        ackRequired: 'يجب الموافقة على الإقرار للمتابعة'
      }
    },
    storeProfile: {
      title: 'ملف المتجر',
      kpi: 'مؤشرات الأداء',
      docs: 'المستندات والتراخيص',
      tabs: {
        overview: 'نظرة عامة',
        orders: 'الطلبات',
        disputes: 'النزاعات والشكاوى',
        reviews: 'التقييمات',
        financial: 'السجل المالي',
        sessions: 'الجلسات والأمان',
        contract: 'بيانات العقد'
      },
      financial: {
        available: 'الرصيد المتاح',
        pending: 'الرصيد المعلق',
        frozen: 'المبالغ المجمدة',
        lifetime: 'صافي الأرباح',
        totalSales: 'إجمالي المبيعات',
        completedOrders: 'الطلبات المكتملة',
        ready: 'قابل للسحب فوراً',
        verification: 'تحت إجراءات التحقق',
        frozenAwaiting: 'في انتظار حل النزاعات',
        totalSalesSub: 'القيمة الإجمالية للطلبات',
        completedOrdersSub: 'الطلبات المسلمة والمحصلة',
        since: 'منذ تاريخ الانضمام',
        walletLedger: 'سجل حركات المحفظة',
        withdrawalLedger: 'سجل طلبات السحب والبنوك',
        operationDate: 'العملية / التاريخ',
        amount: 'المبلغ',
        status: 'الحالة',
        description: 'البيان',
        bankDate: 'البنك / التاريخ',
        payoutMethod: 'طريقة السداد',
        orderId: 'رقم الطلب',
        date: 'التاريخ',
        paymentStatus: 'حالة الدفع',
        orderStatus: 'حالة الطلب',
        operation: 'العملية',
        actions: 'إجراء',
        method: 'الطريقة',
        reviewDate: 'تاريخ المراجعة',
        requestDate: 'تاريخ الطلب',
        sales: 'مبيعات',
        withdrawal: 'سحب',
        noTransactions: 'لا توجد حركات مالية حالياً',
        noWithdrawals: 'لا توجد طلبات سحب سابقة',
        types: {
            CREDIT: 'إيداع (له)',
            DEBIT: 'سحب (عليه)'
        },
        withdrawStatus: {
            COMPLETED: 'مكتمل',
            PENDING: 'قيد المراجعة',
            REJECTED: 'مرفوض'
        }
      },
      details: {
        category: 'التصنيف',
        address: 'العنوان',
        makes: 'تخصص الماركات',
        models: 'تخصص الموديلات',
        joinDate: 'تاريخ الانضمام',
        owner: 'المالك',
        storeCode: 'رمز المتجر',
        status: 'الحالة',
        balance: 'الرصيد المتاح',
        pendingBalance: 'الرصيد المعلق',
        frozenBalance: 'الرصيد المجمد',
        lifetimeEarnings: 'إجمالي الأرباح',
        performance: 'مؤشر الأداء'
      },
      actions: {
        approve: 'اعتماد المتجر',
        ban: 'حظر المتجر',
        suspend: 'إيقاف مؤقت',
        reject: 'رفض التسجيل',
        unblock: 'إلغاء الحظر',
        saveNotes: 'حفظ الملاحظات الإدارية'
      },
      banModal: {
        title: 'إجراء إداري على الحساب',
        permanent: 'حظر دائم (Blocked)',
        temporary: 'إيقاف مؤقت (Suspended)',
        duration: 'مدة الإيقاف (بالأيام)',
        reason: 'سبب الإجراء (سيظهر للتاجر)',
        confirm: 'تأكيد الإجراء',
        cancel: 'إلغاء'
      },
      docStatus: {
        valid: 'سارية',
        expired: 'منتهية',
        pending: 'قيد المراجعة'
      },
      docTypes: {
        cr: 'السجل التجاري',
        license: 'الرخصة / الهوية',
        id: 'الهوية الوطنية',
        iban: 'شهادة الآيبان',
        auth_letter: 'خطاب التفويض'
      },
      adminNotes: 'ملاحظات إدارية داخلية (لا يراها التاجر)',
      noData: 'لا توجد بيانات متاحة حالياً'
    },
    disputeManager: {
      title: 'مركز فض النزاعات',
      caseId: 'رقم القضية',
      heldAmount: 'المبلغ المحجوز (Escrow)',
      verdict: 'إصدار الحكم',
      refundCustomer: 'حكم لصالح العميل (استرداد)',
      releaseFunds: 'حكم لصالح التاجر (تحرير المبلغ)',
      partialRefund: 'تسوية جزئية',
      evidence: 'مقارنة الأدلة',
      customerEvidence: 'أدلة العميل',
      merchantEvidence: 'رد التاجر',
      investigationNotes: 'ملاحظات التحقيق الداخلي',
      timeline: 'سجل النزاع',
      adminNotes: 'ملاحظات الحكم',
      confirmVerdict: 'تأكيد الحكم وإغلاق القضية',
      returnLifecycle: 'دورة حياة الإرجاع',
      steps: {
        requested: 'تم الطلب',
        negotiation: 'نقاش/نزاع',
        approved: 'موافقة المتجر',
        waybill: 'بوليصة الإرجاع',
        handover: 'تسليم العميل',
        received: 'استلام المتجر',
        refunded: 'إتمام الاسترداد'
      },
      status: {
        open: 'مفتوح',
        awaiting_merchant: 'بانتظار التاجر',
        awaiting_admin: 'بانتظار الحكم',
        under_review: 'قيد المراجعة الإدارية',
        resolved: 'تم الحل',
        refunded: 'تم الاسترداد',
        escalated: 'تم التصعيد (تجاوز الوقت)'
      },
      verdictTypes: {
        refund_full: 'استرداد كامل للعميل',
        refund_partial: 'استرداد جزئي',
        release_merchant: 'تحرير المبلغ للتاجر',
        replace: 'استبدال القطعة (ضمان)',
        deny: 'رفض النزاع'
      },
      faultParties: {
        customer: 'العميل',
        merchant: 'التاجر',
        both: 'كلاهما',
        shipping: 'شركة الشحن',
        platform: 'المنصة'
      },
      tabs: {
        all: 'الرقابة الشاملة',
        escrow: 'الضمان والتدقيق',
        urgent: 'عاجل / الساعات الأخيرة',
        closed: 'القضايا المغلقة'
      },
      intelligence: {
        title: 'ذكاء الرقابة (Case Intelligence)',
        logisticsLinkage: 'الارتباط اللوجستي',
        invoiceRef: 'مرجع الفاتورة',
        shipmentRef: 'مرجع الشحنة',
        userIntegrity: 'سجل نزاهة المستخدم',
        integrityAlert: 'تنبيه النزاهة',
        returnDisputeRate: 'معدل الإرجاع/النزاع',
        evidenceAudit: 'تدقيق الأدلة',
        noCustomerFiles: 'لا توجد مستندات مرفوعة من العميل',
        executeVerdict: 'تنفيذ الحكم الاستراتيجي',
        viewFullOrderAudit: 'عرض السجل الكامل للطلب',
        escrowClock: 'ساعة الضمان (Escrow)',
        merchantSla: 'مهلة الرد (SLA)'
      },
      verdictTerminal: {
        title: 'محطة الحكم الاستراتيجي',
        subtitle: 'المرحلة الرابعة: التسوية المالية متعددة المتغيرات للقضية رقم',
        assignFaultParty: '1. تحديد الطرف المخطئ',
        financialBreakdown: '2. تفصيل التسوية المالية (ريال)',
        refundAmount: 'مبلغ الاسترداد',
        shippingRefund: 'استرداد قيمة الشحن',
        platformFeeLoss: 'خسارة رسوم المنصة (Stripe)',
        totalPayout: 'إجمالي المبلغ المستحق',
        selectVerdictPath: '3. اختيار مسار الحكم النهائي',
        investigationNotes: '4. ملاحظات التحقيق (داخلية)',
        decisionRationale: '5. منطق القرار النهائي (علني للعميل والمتجر)',
        noActiveDisputes: 'لا توجد نزاعات نشطة في النطاق المحدد',
        selectCasePrompt: 'اختر قضية من القائمة لعرض بيانات الرقابة والتحليل.'
      }
    },
    shippingPage: {
      title: 'إدارة الشحن',
      activeShipments: 'شحنات نشطة',
      delayedShipments: 'شحنات متأخرة',
      waybill: 'رقم البوليصة',
      courier: 'شركة الشحن',
      pickupDate: 'تاريخ الاستلام',
      expectedDelivery: 'المتوقع',
      status: 'الحالة',
      track: 'تتبع'
    },
    auditPage: {
      title: 'سجل العمليات (Audit Logs)',
      filterActor: 'المنفذ',
      filterAction: 'العملية',
      filterEntity: 'الكيان',
      timestamp: 'الوقت',
      changes: 'التغييرات (JSON)',
      actor: 'المستخدم',
      details: 'تفاصيل السجل',
      liveMonitoring: 'مراقب السجل اللحظي',
      realtimeMode: 'وضع البث المباشر (2026)',
      activityLog: 'نشاطات النظام',
      reason: 'السبب (Reason)',
      actorId: 'معرف المنفذ',
      defaultReason: 'إجراء روتيني مؤتمت بالكامل',
      systemActor: 'نظام الجدولة الذكي',
      searchPlaceholder: 'ابحث في السجلات، المعرفات، أو المنفذين...',
      noLogs: 'لم يتم العثور على أي نشاط في النطاق المحدد.',
      previousState: 'الحالة السابقة',
      newState: 'الحالة الجديدة',
      metadata: 'بيانات وصفية إضافية',
      actions: {
        CREATE: 'إنشاء جديد',
        UPDATE: 'تحديث بيانات',
        DELETE: 'حذف نهائي',
        STATUS_CHANGE: 'تغيير حالة',
        FINANCIAL: 'عملية مالية'
      },
      reasons: {
        AUDIT_REASON_SYSTEM_AUTOMATED: 'إجراء آلي من النظام (تلقائي)',
        AUDIT_REASON_NO_REASON_PROVIDED: 'لم يتم ذكر سبب من قبل المنفذ'
      },
      loadingMore: 'جارٍ جلب السجلات القديمة...',
      endOfLogs: 'وصلت إلى نهاية السجل الاستراتيجي',
      entities: {
        ALL: 'كل الكيانات',
        STORE: 'المتاجر والبروفايلات',
        ORDER: 'الطلبات والعمليات',
        USER: 'المستخدمين والأمان',
        SYSTEM: 'برمجيات النظام'
      }
    },
    billing: {
      title: 'الفواتير والمالية',
      totalRevenue: 'إجمالي الدخل',
      pendingPayouts: 'تحويلات معلقة',
      netIncome: 'صافي الأرباح',
      invoiceId: 'رقم الفاتورة',
      type: 'النوع',
      amount: 'المبلغ',
      status: 'الحالة',
      date: 'التاريخ',
      frozen: 'أموال مجمدة (نزاعات)',
      types: {
        CUSTOMER_INVOICE: 'فاتورة مبيعات',
        COMMISSION_INVOICE: 'فاتورة عمولة',
        PAYOUT_INVOICE: 'سند تحويل',
        SHIPPING_INVOICE: 'فاتورة شحن'
      },
      statusTypes: {
        PAID: 'مدفوعة',
        PENDING: 'معلقة',
        REFUNDED: 'مستردة',
        FAILED: 'فشلت'
      },
      invoiceViewer: {
        taxInvoice: 'فاتورة ضريبية',
        seller: 'البائع',
        buyer: 'المشتري',
        invoiceNo: 'رقم الفاتورة',
        issueDate: 'تاريخ الإصدار',
        supplyDate: 'تاريخ التوريد',
        vatNo: 'الرقم الضريبي',
        item: 'البيان',
        qty: 'الكمية',
        unitPrice: 'سعر الوحدة',
        subtotal: 'المجموع (غير شامل)',
        vat: 'ضريبة القيمة المضافة (15%)',
        total: 'الإجمالي (شامل الضريبة)',
        totalDue: 'الإجمالي المستحق',
        shipping: 'الشحن والتوصيل',
        notes: 'ملاحظات',
        generatedBy: 'تم إصدار الفاتورة إلكترونياً بواسطة نظام إي تشليح'
      },
    },
    violationsPage: {
      title: 'نظام المخالفات والعقوبات',
      subtitle: 'إدارة مخالفات المتاجر والعملاء، ومراجعة الطعون والعقوبات الآلية.',
      tabs: {
        active: 'المخالفات النشطة',
        appeals: 'طلبات الطعن',
        penalties: 'العقوبات المعلقة',
        types: 'أنواع المخالفات',
        thresholds: 'حدود العقوبات'
      },
      stats: {
        total: 'إجمالي المخالفات',
        pendingAppeals: 'طعون معلقة',
        pendingPenalties: 'عقوبات بانتظار المراجعة',
        pointsDecayed: 'نقاط تم استعادتها'
      },
      table: {
        id: 'المعرف',
        target: 'الهدف',
        type: 'النوع',
        points: 'النقاط',
        fine: 'الغرامة',
        status: 'الحالة',
        date: 'التاريخ',
        actions: 'الإجراءات',
        decayDays: 'أيام التحلل',
        threshold: 'حد النقاط',
        action: 'العقوبة المقترحة',
        duration: 'المدة (أيام)'
      },
      actions: {
        issue: 'إصدار مخالفة',
        reviewAppeal: 'مراجعة الطعن',
        reviewPenalty: 'مراجعة العقوبة',
        editType: 'تعديل النوع',
        addType: 'إضافة نوع جديد',
        addThreshold: 'إضافة حد عقوبة',
        viewEvidence: 'عرض الدليل',
        approve: 'قبول',
        reject: 'رفض'
      },
      targets: {
        MERCHANT: 'تاجر',
        CUSTOMER: 'عميل',
        SCOPE: 'نطاق'
      },
      penaltyActions: {
        WARNING: 'تنبيه رسمي',
        TEMPORARY_SUSPENSION: 'إيقاف مؤقت للحساب',
        PERMANENT_BAN: 'حظر نهائي وشامل',
        FEE_INCREASE: 'زيادة رسوم العمولة'
      },
      forms: {
        targetUser: 'المستهدف',
        targetType: 'نوع الفئة',
        violationType: 'نوع المخالفة',
        typeNameAr: 'اسم المخالفة (بالعربية)',
        typeNameEn: 'اسم المخالفة (بالإنجليزية)',
        reason: 'تفاصيل السبب',
        evidence: 'رابط الدليل (اختياري)',
        points: 'النقاط',
        fineAmount: 'قيمة الغرامة',
        decayDays: 'أيام التحلل (Decay Days)',
        scoreThreshold: 'حد النقاط التراكمي',
        penaltyAction: 'الإجراء التلقائي',
        durationDays: 'المدة (بالأيام - اختيارى)',
        submit: 'حفظ البيانات',
        cancel: 'إلغاء',
        permanent: 'دائم'
      }
    },
    systemSettings: {
      platformName: 'اسم المنصة',
      contactEmail: 'بريد الدعم الفني',
      supportPhone: 'رقم الدعم الفني',
      enablePreferences: 'تفعيل خطوة التفضيلات',
      commissionRate: 'نسبة العمولة',
      minCommission: 'الحد الأدنى للعمولة (AED)',
      baseShipping: 'تكلفة الشحن الأساسية',
      shippingRules: 'قواعد الشحن',
      minWeight: 'الوزن الأدنى',
      maxWeight: 'الوزن الأقصى',
      price: 'السعر',
      maintenanceMode: 'وضع الصيانة',
      maintenanceMsg: 'رسالة الصيانة',
      saveSuccess: 'تم حفظ الإعدادات بنجاح',
      realtimeUpdate: 'تم تحديث الإعدادات لحظياً'
    }
  },
  en: {
    dashboard: 'Dashboard',
    users: 'Store Management',
    customers: 'Customers',
    reviews: 'Reviews',
    orders: 'Orders Control',
    settings: 'System Settings',
    disputes: 'Dispute Resolution',
    shipping: 'Shipping Management',
    auditLogs: 'Audit Logs',
    violations: 'Violations & Penalties',
    automations: {
      active: 'Automations Active',
      stopped: 'Automations Stopped'
    },
    riskTimer: {
      sla: 'SLA Timer',
      overdue: 'Overdue by',
      hours: 'h'
    },
    actions: {
      refresh: 'Refresh Data',
      viewReport: 'View Report',
      viewDocs: 'View Docs',
      noActions: 'No actions',
      move: 'Move to',
      force: 'Force',
      danger: 'Danger Zone (Force)',
      superReq: 'Super Admin Access Required',
      forceWarningDialog: '⚠️ FORCE UPDATE WARNING\n\nYou are about to bypass FSM rules and force status manually.\nThis will be logged in Audit Trails.\n\nContinue?'
    },
    security: {
      title: 'Security & Audit Center',
      auditTrail: 'Audit Trail',
      protection: 'Active Protection',
      config: 'Security Config',
      webhookStatus: 'Webhook Status',
      threats: 'Threat Attempts',
      blockedIps: 'Blocked IPs',
      encryption: 'Encryption',
      stripe: 'Stripe Protection',
      ratelimit: 'Rate Limiting',
      mfa: '2FA Status'
    },
    support: {
      title: 'Technical Support',
      tickets: 'Tickets',
      subtitle: 'Support Center',
      createTicket: 'Open New Ticket',
      newTicketTitle: 'Ticket Details',
      subject: 'Subject',
      message: 'Message',
      myTickets: 'My Tickets',
      noTickets: 'No past support tickets',
      noTicketsDesc: 'You haven\'t submitted any support tickets yet.',
      liveChat: 'Live Chat',
      liveChatDesc: 'Talk to a representative now'
    },
    settingsTabs: {
      general: 'General',
      financial: 'Financial',
      logistics: 'Logistics',
      content: 'Content'
    },
    financials: {
      title: 'Financials & Commissions',
      commission: 'Platform Commission Rate',
      updateCommission: 'Update Rate',
      logs: 'Financial Logs'
    },
    welcome: 'Command Center',
    welcomeSub: 'Comprehensive overview of platform performance today.',
    headers: {
      recentOrders: 'Recent Orders'
    },
    kpi: {
      totalSales: 'Total Sales',
      commission: 'Net Profit',
      profitSub: 'Platform Profits',
      customers: 'Registered Customers',
      stores: 'Partner Stores',
      orders: 'Total Orders',
      disputes: 'Open Cases'
    },
    charts: {
      salesTrend: 'Sales Trend',
      orderStatus: 'Order Status Distribution',
      topStores: 'Top Selling Stores'
    },
    alerts: {
      title: 'Smart Alerts',
      noAlerts: 'System stable, no alerts.',
      types: {
        no_response: 'Store No Response',
        late_prep: 'Late Preparation',
        late_ship: 'Late Shipping',
        license_expiry: 'License Expiring Soon',
        license_expired: 'License Expired',
        dispute: 'New Dispute',
        unpaid: 'Unpaid Order'
      },
      legend: {
        completed: 'Completed',
        active: 'Active',
        pending: 'Pending',
        issues: 'Issues'
      },
      actions: {
        viewOrder: 'View Order',
        viewStore: 'Store Profile',
        resolve: 'Resolve'
      }
    },
    stats: {
      totalRevenue: 'Total Revenue'
    },
    usersTable: {
      name: 'Store Name',
      owner: 'Owner',
      role: 'Role',
      status: 'License Status',
      actions: 'Actions',
      verify: 'Verify Docs',
      joined: 'Joined Date',
      filters: {
        all: 'All',
        pending: 'Pending Verification'
      },
      readOnly: 'Support Account: Read-only access enabled.'
    },
    customersTable: {
      name: 'Customer Name',
      contact: 'Contact Info',
      orders: 'Orders',
      status: 'Status',
      joined: 'Joined Date',
      actions: 'Actions',
      ltv: 'Lifetime Value (LTV)',
      successRate: 'Success Rate',
      adminNotes: 'Private Admin Notes'
    },
    customerProfile: {
      title: 'Customer Profile',
      identity: 'Identity & Info',
      activity: 'Activity & Sessions',
      notes: 'Admin Notes',
      status: 'Account Status',
      orders: 'Order History',
      disputes: 'Disputes & Complaints',
      devices: 'Connected Devices',
      lastLogin: 'Last Login',
      resetPass: 'Reset Password',
      suspendAccount: 'Suspend Account'
    },
    chatOversight: {
      title: 'Chat Oversight',
      subtitle: 'Monitor active conversations between customers and merchants',
      joinChat: 'Join Chat',
      deleteChat: 'Delete Chat (Global)',
      deleteMessage: 'Delete Message',
      takeEvidence: 'Take Evidence (Snapshot)',
      evidenceCaptured: 'Evidence captured successfully',
      originalLanguage: 'Original',
      translated: 'Translated (AI)',
      systemIntervention: 'Admin Intervention: Monitoring started',
      banUser: 'Ban User',
      chatDeletedByAdmin: 'This chat was deleted by administration'
    },
    reviewsControl: {
      title: 'Reviews Management',
      pending: 'Pending Review',
      published: 'Published',
      rejected: 'Rejected',
      rating: 'Rating',
      comment: 'Comment',
      approve: 'Publish Review',
      reject: 'Reject & Delete',
      rejectReason: 'Rejection Reason'
    },
    ordersTable: {
      id: 'Order ID',
      customer: 'Customer',
      merchant: 'Merchant',
      status: 'Status',
      force: 'Change Status',
      amount: 'Amount',
      date: 'Date',
      parts: 'Parts Details',
      financialDetails: 'Financial Details',
      exportCSV: 'Export CSV',
      otherParts: 'other parts',
      noMatches: 'No matching orders found',
      filterAll: 'Filter: All'
    },
    orderDetails: {
      title: 'Order Details',
      timeline: 'Event Log',
      financials: 'Financial Summary',
      participants: 'Participants',
      basePrice: 'Base Price',
      shipping: 'Shipping Fees',
      subtotal: 'Subtotal',
      commission: 'Platform Commission',
      total: 'Total (Customer)',
      forceStatus: 'Force New Status',
      forceWarning: 'Warning: Manual status change may affect workflow.',
      customerInfo: 'Customer Info',
      merchantInfo: 'Merchant Info',
      viewInvoice: 'View Invoice',
      lastUpdated: 'Last Updated',
      currentStatus: 'Current Status',
      availableActions: 'Available Actions',
      noImage: 'No Image',
      car: 'Car',
      vin: 'VIN',
      offersCount: 'Offers',
      pendingFinancials: 'Financial data pending offer acceptance',
      notFound: 'Order not found',
      editOfferModal: {
        title: 'Comprehensive Edit Offer',
        unitPrice: 'Unit Price',
        shippingCost: 'Shipping Cost',
        weight: 'Weight',
        deliveryDays: 'Delivery Days',
        condition: 'Condition',
        partType: 'Part Type',
        hasWarranty: 'Has Warranty',
        warrantyDuration: 'Warranty Duration',
        merchantName: 'Merchant Name',
        isShippingIncluded: 'Shipping Included in Price',
        notes: 'Offer Notes',
        save: 'Save Changes',
        cancel: 'Cancel',
        placeholderNotes: 'Add any additional notes here...',
        conditions: {
          new: 'New',
          used_clean: 'Used - Clean',
          used_scratched: 'Used - Scratched',
          for_parts: 'For Parts (Scrap)'
        },
        partTypes: {
          oem: 'Original (OEM)',
          aftermarket: 'Aftermarket',
          commercial: 'First Class Commercial',
          rebuilt: 'Rebuilt'
        }
      },
      verificationReview: {
        modalTitle: 'Approve Document Verification',
        employeeName: 'Responsible Employee Name',
        signatureTitle: 'Employee Signature',
        acknowledgment: 'I, the aforementioned employee, hereby confirm the accuracy of the part\'s matching to the attached documents under my personal responsibility.',
        submitReview: 'Approve & Submit',
        cancel: 'Cancel',
        signingDate: 'Verification Date',
        details: 'Administrative Review Details',
        detailsPlaceholder: 'Write detailed notes about the part verification and document matching...',
        detailsRequired: 'Review details are required to proceed with rejection',
        nameRequired: 'Please type your full name',
        signatureRequired: 'Please sign to continue',
        ackRequired: 'Acknowledgment is required to proceed'
      }
    },
    storeProfile: {
      title: 'Store Profile',
      kpi: 'Performance Indicators',
      docs: 'Docs & Licenses',
      tabs: {
        overview: 'Overview',
        orders: 'Orders',
        disputes: 'Disputes & Claims',
        reviews: 'Reviews',
        financial: 'Financial Journal',
        sessions: 'Sessions & Security',
        contract: 'Contract Details'
      },
      financial: {
        available: 'Available Balance',
        pending: 'Pending Clearance',
        frozen: 'Escrow / Frozen',
        lifetime: 'Net Lifetime Earnings',
        totalSales: 'Total Sales Volume',
        completedOrders: 'Completed Orders',
        ready: 'Available/Withdrawal Ready',
        verification: 'Under Verification',
        frozenAwaiting: 'Awaiting Resolution',
        totalSalesSub: 'Gross Order Value',
        completedOrdersSub: 'Delivered & Paid',
        since: 'Joined Since',
        walletLedger: 'Wallet Ledger',
        withdrawalLedger: 'Withdrawal Ledger',
        operationDate: 'Operation / Date',
        amount: 'Amount',
        status: 'Status',
        description: 'Description',
        bankDate: 'Bank / Date',
        payoutMethod: 'Payout Method',
        orderId: 'Order Number',
        date: 'Date',
        paymentStatus: 'Payment Status',
        orderStatus: 'Order Status',
        operation: 'Operation',
        actions: 'Action',
        method: 'Method',
        reviewDate: 'Review Date',
        requestDate: 'Request Date',
        sales: 'Sales',
        withdrawal: 'Withdrawal',
        noTransactions: 'No recent transactions currently',
        noWithdrawals: 'No withdrawal history found',
        types: {
            CREDIT: 'Credit (+)',
            DEBIT: 'Debit (-)'
        },
        withdrawStatus: {
            COMPLETED: 'Completed',
            PENDING: 'Pending Review',
            REJECTED: 'Rejected'
        }
      },
      details: {
        category: 'Category',
        address: 'Address',
        makes: 'Makes Specialization',
        models: 'Models Specialization',
        joinDate: 'Join Date',
        owner: 'Owner',
        storeCode: 'Store Code',
        status: 'Status',
        balance: 'Available Balance',
        pendingBalance: 'Pending Balance',
        frozenBalance: 'Frozen Balance',
        lifetimeEarnings: 'Lifetime Earnings',
        performance: 'Performance Score'
      },
      actions: {
        approve: 'Approve Store',
        ban: 'Ban Store',
        suspend: 'Suspend',
        reject: 'Reject Registration',
        unblock: 'Unblock Store',
        saveNotes: 'Save Admin Notes'
      },
      banModal: {
        title: 'Account Administrative Action',
        permanent: 'Permanent Ban (Blocked)',
        temporary: 'Temporary Suspension (Suspended)',
        duration: 'Duration (Days)',
        reason: 'Reason (Visible to Merchant)',
        confirm: 'Confirm Action',
        cancel: 'Cancel'
      },
      docStatus: {
        valid: 'Valid',
        expired: 'Expired',
        pending: 'Pending Review'
      },
      docTypes: {
        cr: 'Commercial Register',
        license: 'License / ID',
        id: 'National ID',
        iban: 'IBAN Certificate',
        auth_letter: 'Authorization Letter'
      },
      adminNotes: 'Internal Admin Notes (Private)',
      noData: 'No data available at the moment'
    },
    disputeManager: {
      title: 'Dispute Resolution Center',
      caseId: 'Case ID',
      heldAmount: 'Held Amount (Escrow)',
      verdict: 'Issue Verdict',
      refundCustomer: 'Refund Customer',
      releaseFunds: 'Release Funds to Merchant',
      partialRefund: 'Partial Settlement',
      evidence: 'Evidence Comparison',
      customerEvidence: 'Customer Evidence',
      merchantEvidence: 'Merchant Response',
      investigationNotes: 'Internal Investigation Notes',
      timeline: 'Dispute Log',
      adminNotes: 'Judge Notes',
      confirmVerdict: 'Confirm Verdict & Close',
      returnLifecycle: 'Return Lifecycle',
      steps: {
        requested: 'Requested',
        negotiation: 'Negotiation',
        approved: 'Approved',
        waybill: 'Return Waybill',
        handover: 'Handover',
        received: 'Received',
        refunded: 'Refunded'
      },
      status: {
        open: 'Open',
        awaiting_merchant: 'Awaiting Merchant',
        awaiting_admin: 'Awaiting Admin',
        under_review: 'Under Administrative Review',
        resolved: 'Resolved',
        refunded: 'Refunded',
        escalated: 'Escalated (Timeout)'
      },
      verdictTypes: {
        refund_full: 'Full Refund to Customer',
        refund_partial: 'Partial Refund',
        release_merchant: 'Release Funds to Merchant',
        replace: 'Warranty Replacement',
        deny: 'Deny Dispute'
      },
      faultParties: {
        customer: 'Customer',
        merchant: 'Merchant',
        both: 'Both Parties',
        shipping: 'Shipping Company',
        platform: 'Platform'
      },
      tabs: {
        all: 'All Oversight',
        escrow: 'Escrow / Audit',
        urgent: 'Urgent / Timeout',
        closed: 'Closed Cases'
      },
      intelligence: {
        title: 'Case Intelligence',
        logisticsLinkage: 'Logistics Linkage',
        invoiceRef: 'Invoice Ref',
        shipmentRef: 'Shipment Ref',
        userIntegrity: 'User Integrity Score',
        integrityAlert: 'Integrity Alert',
        returnDisputeRate: 'Return-Dispute Rate',
        evidenceAudit: 'Evidence Audit',
        noCustomerFiles: 'No customer files uploaded',
        executeVerdict: 'Execute Strategic Verdict',
        viewFullOrderAudit: 'View Full Order Audit',
        escrowClock: 'Escrow Clock',
        merchantSla: 'Merchant SLA'
      },
      verdictTerminal: {
        title: 'Strategic Verdict Terminal',
        subtitle: 'Phase 4: Multi-variable Financial Resolution for Case #',
        assignFaultParty: '1. Assign Fault Party',
        financialBreakdown: '2. Financial Breakdown (SAR)',
        refundAmount: 'Refund Amount',
        shippingRefund: 'Shipping Refund',
        platformFeeLoss: 'Platform Fee Loss (Stripe)',
        totalPayout: 'Total Payout',
        selectVerdictPath: '3. Select Verdict Path',
        investigationNotes: '4. Investigation Notes (Internal)',
        decisionRationale: '5. Final Decision Rationale (Public)',
        noActiveDisputes: 'No Active Disputes in Range',
        selectCasePrompt: 'Select a case for oversight intelligence'
      }
    },
    shippingPage: {
      title: 'Shipping Management',
      activeShipments: 'Active Shipments',
      delayedShipments: 'Delayed Shipments',
      waybill: 'Waybill No',
      courier: 'Courier',
      pickupDate: 'Pickup Date',
      expectedDelivery: 'Expected',
      status: 'Status',
      track: 'Track'
    },
    auditPage: {
      title: 'Audit Logs',
      filterActor: 'Actor',
      filterAction: 'Action',
      filterEntity: 'Entity',
      timestamp: 'Timestamp',
      changes: 'Changes (JSON)',
      actor: 'User',
      details: 'Log Details',
      liveMonitoring: 'Live Audit Monitor',
      realtimeMode: 'Real-time Streaming Mode',
      activityLog: 'System Activities',
      reason: 'Reason',
      actorId: 'Actor ID',
      defaultReason: 'Automated Routine Procedure',
      systemActor: 'System Scheduler',
      searchPlaceholder: 'Search logic, IDs, or actors...',
      noLogs: 'No activities found in the selected range.',
      previousState: 'Previous State',
      newState: 'New State',
      metadata: 'Additional Metadata',
      actions: {
        CREATE: 'Create New',
        UPDATE: 'Update Data',
        DELETE: 'Permanent Delete',
        STATUS_CHANGE: 'Status Change',
        FINANCIAL: 'Financial Action'
      },
      reasons: {
        AUDIT_REASON_SYSTEM_AUTOMATED: 'Automated System Action',
        AUDIT_REASON_NO_REASON_PROVIDED: 'No reason provided by actor'
      },
      loadingMore: 'Fetching legacy logs...',
      endOfLogs: 'End of strategic audit stream',
      entities: {
        ALL: 'All Entities',
        STORE: 'Stores & Profiles',
        ORDER: 'Orders & Ops',
        USER: 'Users & Security',
        SYSTEM: 'System Internals'
      }
    },
    billing: {
      title: 'Billing & Finance',
      totalRevenue: 'Total Revenue',
      pendingPayouts: 'Pending Payouts',
      netIncome: 'Net Income',
      invoiceId: 'Invoice ID',
      type: 'Type',
      amount: 'Amount',
      status: 'Status',
      date: 'Date',
      frozen: 'Frozen Funds (Disputes)',
      types: {
        CUSTOMER_INVOICE: 'Sales Invoice',
        COMMISSION_INVOICE: 'Commission Invoice',
        PAYOUT_INVOICE: 'Payout Receipt',
        SHIPPING_INVOICE: 'Shipping Invoice'
      },
      statusTypes: {
        PAID: 'Paid',
        PENDING: 'Pending',
        REFUNDED: 'Refunded',
        FAILED: 'Failed'
      },
      invoiceViewer: {
        taxInvoice: 'Tax Invoice',
        seller: 'Seller',
        buyer: 'Buyer',
        invoiceNo: 'Invoice No',
        issueDate: 'Issue Date',
        supplyDate: 'Supply Date',
        vatNo: 'VAT Number',
        item: 'Description',
        qty: 'Qty',
        unitPrice: 'Unit Price',
        subtotal: 'Subtotal (Excl. VAT)',
        vat: 'VAT (15%)',
        total: 'Total (Inc. VAT)',
        totalDue: 'Total Due',
        shipping: 'Shipping & Delivery',
        notes: 'Notes',
        generatedBy: 'Invoice generated electronically by E-Tashleh System'
      },
    },
    violationsPage: {
      title: 'Violations & Penalty System',
      subtitle: 'Manage store and customer violations, review appeals and automated penalties.',
      tabs: {
        active: 'Active Violations',
        appeals: 'Appeals',
        penalties: 'Pending Penalties',
        types: 'Violation Types',
        thresholds: 'Penalty Thresholds'
      },
      stats: {
        total: 'Total Violations',
        pendingAppeals: 'Pending Appeals',
        pendingPenalties: 'Pending Penalties',
        pointsDecayed: 'Points Decayed'
      },
      table: {
        id: 'ID',
        target: 'Target',
        type: 'Type',
        points: 'Points',
        fine: 'Fine',
        status: 'Status',
        date: 'Date',
        actions: 'Actions',
        decayDays: 'Decay Days',
        threshold: 'Score Threshold',
        action: 'Triggered Action',
        duration: 'Duration (Days)'
      },
      actions: {
        issue: 'Issue Violation',
        reviewAppeal: 'Review Appeal',
        reviewPenalty: 'Review Penalty',
        editType: 'Edit Type',
        addType: 'Add New Type',
        addThreshold: 'Add Threshold',
        viewEvidence: 'View Evidence',
        approve: 'Approve',
        reject: 'Reject'
      },
      targets: {
        MERCHANT: 'Merchant',
        CUSTOMER: 'Customer',
        SCOPE: 'Scope'
      },
      penaltyActions: {
        WARNING: 'Official Warning',
        TEMPORARY_SUSPENSION: 'Temporary Suspension',
        PERMANENT_BAN: 'Permanent Ban',
        FEE_INCREASE: 'Fee Increase'
      },
      forms: {
        targetUser: 'Target User',
        targetType: 'Target Type',
        violationType: 'Violation Type',
        typeNameAr: 'Name (Arabic)',
        typeNameEn: 'Name (English)',
        reason: 'Reason Details',
        evidence: 'Evidence URL (optional)',
        points: 'Points',
        fineAmount: 'Fine Amount',
        decayDays: 'Points Decay (Days)',
        scoreThreshold: 'Cumulative Score Threshold',
        penaltyAction: 'Automated Penalty Action',
        durationDays: 'Duration (Days - optional)',
        submit: 'Save Changes',
        cancel: 'Cancel',
        permanent: 'Permanent'
      }
    },
    systemSettings: {
      platformName: 'Platform Name',
      contactEmail: 'Support Email',
      supportPhone: 'Support Phone',
      enablePreferences: 'Enable Preferences Step',
      commissionRate: 'Commission Rate',
      minCommission: 'Minimum Commission (AED)',
      baseShipping: 'Base Shipping Cost',
      shippingRules: 'Shipping Rules',
      minWeight: 'Min Weight',
      maxWeight: 'Max Weight',
      price: 'Price',
      maintenanceMode: 'Maintenance Mode',
      maintenanceMsg: 'Maintenance Message',
      saveSuccess: 'Settings saved successfully',
      realtimeUpdate: 'Settings updated in real-time'
    }
  }
};
