
export const admin = {
  ar: {
    dashboard: 'لوحة القيادة',
    users: 'إدارة المتاجر',
    customers: 'العملاء',
    reviews: 'التقييمات',
    orders: 'التحكم بالطلبات',
    settings: 'إعدادات النظام',
    disputes: 'فض النزاعات',
    shipping: 'إدارة الشحن',
    auditLogs: 'سجل العمليات',
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
      tickets: 'التذاكر'
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
      commission: 'صافي العمولة',
      customers: 'العملاء المسجلين',
      stores: 'المتاجر الشريكة',
      orders: 'إجمالي الطلبات',
      disputes: 'قضايا مفتوحة'
    },
    charts: {
      salesTrend: 'اتجاه المبيعات (30 يوم)',
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
      name: 'الاسم',
      contact: 'معلومات الاتصال',
      orders: 'الطلبات',
      status: 'الحالة',
      joined: 'تاريخ التسجيل',
      actions: 'الإجراءات'
    },
    customerProfile: {
      title: 'ملف العميل',
      info: 'البيانات الشخصية',
      security: 'الأمان والجلسات',
      activity: 'سجل النشاط',
      orders: 'سجل الطلبات',
      disputes: 'الشكاوى والنزاعات',
      devices: 'الأجهزة المتصلة',
      lastLogin: 'آخر دخول',
      resetPass: 'إعادة تعيين كلمة المرور',
      suspendAccount: 'تعليق الحساب'
    },
    reviewsControl: {
      title: 'إدارة التقييمات',
      pending: 'بانتظار المراجعة',
      published: 'منشورة',
      rejected: 'مرفوضة',
      rating: 'التقييم',
      comment: 'التعليق',
      approve: 'نشر التقييم',
      reject: 'رفض وحذف',
      rejectReason: 'سبب الرفض'
    },
    ordersTable: {
      id: 'رقم الطلب',
      customer: 'العميل',
      merchant: 'التاجر',
      status: 'الحالة',
      force: 'تغيير الحالة',
      amount: 'المبلغ',
      date: 'التاريخ'
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
      notFound: 'الطلب غير موجود'
    },
    storeProfile: {
      title: 'ملف المتجر',
      kpi: 'مؤشرات الأداء',
      docs: 'المستندات والتراخيص',
      actions: {
        approve: 'اعتماد المتجر',
        ban: 'حظر المتجر',
        suspend: 'إيقاف مؤقت'
      },
      docStatus: {
        valid: 'سارية',
        expired: 'منتهية',
        pending: 'قيد المراجعة'
      }
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
        resolved: 'تم الحل',
        refunded: 'تم الاسترداد'
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
      details: 'تفاصيل السجل'
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
      }
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
      tickets: 'Tickets'
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
      commission: 'Net Commission',
      customers: 'Registered Customers',
      stores: 'Partner Stores',
      orders: 'Total Orders',
      disputes: 'Open Cases'
    },
    charts: {
      salesTrend: 'Sales Trend (30 Days)',
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
      totalRevenue: 'Total Revenue',
      activeUsers: 'Active Users',
      pendingVendors: 'Pending Vendors',
      openDisputes: 'Open Disputes'
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
      name: 'Name',
      contact: 'Contact Info',
      orders: 'Orders',
      status: 'Status',
      joined: 'Joined Date',
      actions: 'Actions'
    },
    customerProfile: {
      title: 'Customer Profile',
      info: 'Personal Info',
      security: 'Security & Sessions',
      activity: 'Activity Log',
      orders: 'Order History',
      disputes: 'Disputes & Complaints',
      devices: 'Connected Devices',
      lastLogin: 'Last Login',
      resetPass: 'Reset Password',
      suspendAccount: 'Suspend Account'
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
      date: 'Date'
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
      notFound: 'Order not found'
    },
    storeProfile: {
      title: 'Store Profile',
      kpi: 'Performance Indicators',
      docs: 'Docs & Licenses',
      actions: {
        approve: 'Approve Store',
        ban: 'Ban Store',
        suspend: 'Suspend'
      },
      docStatus: {
        valid: 'Valid',
        expired: 'Expired',
        pending: 'Pending Review'
      }
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
        resolved: 'Resolved',
        refunded: 'Refunded'
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
      details: 'Log Details'
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
        generatedBy: 'Generated electronically by E-Tashleh System'
      }
    }
  }
};
