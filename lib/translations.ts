export const translations = {
  en: {
    // App Info
    app: {
      name: "Connect Pro",
      subtitle: "Partners",
      description: "Your trusted digital wallet solution",
    },

    // Splash Screen
    appName: "Connect Pro Partners",
    loading: "Loading...",

    // Login Screen
    login: {
      welcome: "Welcome Back",
      subtitle: "Sign in to access your wallet",
      email: "Email address",
      password: "Password",
      signIn: "Sign In Securely",
      forgotPassword: "Forgot your password?",
    },

    // Dashboard Screen
    dashboard: {
      greeting: "Good morning,",
      userName: "Sarah Johnson",
      totalBalance: "Total Balance",
      growth: "+2.5% from last month",
      actions: {
        deposit: "Deposit",
        withdraw: "Withdraw",
        recharge: "Recharge",
      },
      recentTransactions: "Recent Transactions",
      transactions: {
        salary: "Salary Deposit",
        grocery: "Grocery Store",
        gas: "Gas Station",
        freelance: "Freelance Payment",
        time: {
          hours: "{{count}} hours ago",
          days: "{{count}} day ago",
        },
      },
      noTransactions: "No transactions found",
      transactionHistory: "Transaction History",
      rechargeHistory: "Recharge History",
      referenceCopied: "Reference Copied",
      referenceCopiedDesc: "Transaction reference copied to clipboard",
      copyFailed: "Copy Failed",
      copyFailedDesc: "Failed to copy reference to clipboard",
    },

    // Deposit Screen
    deposit: {
      title: "Deposit Funds",
      subtitle: "Add money to your wallet",
      amount: "Amount",
      amountPlaceholder: "Enter amount",
      method: "Payment Method",
      bankTransfer: "Bank Transfer",
      creditCard: "Credit Card",
      debitCard: "Debit Card",
      confirmDeposit: "Confirm Deposit",
      processing: "Processing...",
      success: "Deposit Successful",
      successMessage: "Your funds have been added to your wallet",
      quickAmount: "Quick Amount",
      recipientPhone: "Recipient Phone Number",
      recipientPhonePlaceholder: "Enter your phone number",
      selectNetwork: "Select Network",
      availableBalance: "Available Balance",
      confirmDescription: "Please review your deposit details before confirming",
    },

    // Withdraw Screen
    withdraw: {
      title: "Withdraw Funds",
      subtitle: "Transfer money from your wallet",
      amount: "Amount",
      amountPlaceholder: "Enter amount",
      method: "Withdrawal Method",
      bankAccount: "Bank Account",
      paypal: "PayPal",
      crypto: "Cryptocurrency",
      confirmWithdraw: "Confirm Withdrawal",
      processing: "Processing...",
      success: "Withdrawal Successful",
      successMessage: "Your funds have been sent to your account",
      quickAmount: "Quick Amount",
      recipientPhone: "Recipient Phone Number",
      recipientPhonePlaceholder: "Enter your phone number",
      selectNetwork: "Select Network",
      availableBalance: "Available Balance",
      confirmDescription: "Please review your withdrawal details before confirming",
    },

    // Recharge Screen
    recharge: {
      title: "Recharge Services",
      subtitle: "Top up your mobile, internet, and other services",
      categories: {
        mobile: "Mobile Recharge",
        internet: "Internet & Cable",
        utilities: "Utilities",
        gaming: "Gaming",
      },
      mobile: {
        title: "Mobile Recharge",
        subtitle: "Recharge your mobile phone",
        operators: "Select Operator",
        plans: "Available Plans",
        data: "Data Plans",
        voice: "Voice Plans",
        combo: "Combo Plans",
      },
      internet: {
        title: "Internet & Cable",
        subtitle: "Pay your internet and cable bills",
        providers: "Select Provider",
        plans: "Available Plans",
      },
      utilities: {
        title: "Utilities",
        subtitle: "Pay electricity, water, and gas bills",
        electricity: "Electricity",
        water: "Water",
        gas: "Gas",
      },
      gaming: {
        title: "Gaming",
        subtitle: "Recharge gaming wallets and subscriptions",
        platforms: "Gaming Platforms",
        wallets: "Gaming Wallets",
      },
      selectPlan: "Select Plan",
      confirmRecharge: "Confirm Recharge",
      processing: "Processing...",
      success: "Recharge Successful",
      successMessage: "Your recharge has been completed successfully",
      quickAmount: "Quick Amount",
      rechargeAmount: "Recharge Amount",
      proofDescription: "Proof Description (Optional)",
      proofDescriptionPlaceholder: "Describe your recharge proof",
      proofImage: "Proof Image (Optional)",
      uploadProofImage: "Upload proof image",
      availableBalance: "Available Balance",
      creatingRecharge: "Creating Recharge...",
      createRecharge: "Create Recharge",
      confirmDescription: "Please review your recharge details before confirming",
    },

    // Footer
    footer: {
      secure: "Secure",
      trusted: "Trusted",
      professional: "Professional",
      encryption: "256-bit SSL encryption",
    },

    // Settings Screen
    settings: {
      title: "Settings",
      account: {
        title: "Account",
        subtitle: "Manage your account settings",
        profile: "Profile",
        profileSubtitle: "Edit your personal information",
        payment: "Payment Methods",
        paymentSubtitle: "Manage your payment options",
        language: "Language",
        theme: "Theme",
        lightTheme: "Light",
        darkTheme: "Dark",
      },
      security: {
        title: "Security & Privacy",
        subtitle: "Protect your account and data",
        password: "Change Password",
        passwordSubtitle: "Update your account password",
        twoFactor: "Two-Factor Authentication",
        enabled: "Enabled",
        biometric: "Biometric Login",
        biometricSubtitle: "Use fingerprint or face recognition",
      },
      notifications: {
        title: "Notifications",
        subtitle: "Control your notification preferences",
        push: "Push Notifications",
        pushSubtitle: "Receive notifications on your device",
        security: "Security Alerts",
        securitySubtitle: "Get notified about security events",
      },
      support: {
        help: "Help Center",
        helpSubtitle: "Get help and support",
      },
      logout: "Logout",
    },

    // Theme Options
    light: "Light",
    dark: "Dark",
    system: "System",

    // Language Options
    english: "English",
    french: "Français",

    // Navigation
    nav: {
      dashboard: "Dashboard",
      transactions: "Transactions",
      accountTransaction: "Account Transaction",
      topup: "Top Up",
      transfer: "Transfer",
      logout: "Logout",
      general: "General",
      transactionManagement: "Transaction Management",
      history: "History",
      topupHistory: "Top-up History",
      bettingPlatforms: "Betting Platforms",
      platforms: "Platforms",
      commissions: "Commissions",
      transferHistory: "Transfer History",
    },

    // Common UI Elements
    common: {
      loading: "Loading...",
      search: "Search",
      filter: "Filter",
      all: "All",
      previous: "Previous",
      next: "Next",
      copy: "Copy",
      download: "Download",
      refresh: "Refresh",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      edit: "Edit",
      delete: "Delete",
      close: "Close",
      back: "Back",
      continue: "Continue",
      retry: "Retry",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Information",
      yes: "Yes",
      no: "No",
      ok: "OK",
    },

    // Transaction History Screen
    transactionHistory: {
      title: "Transaction History",
      subtitle: "View all your transactions",
      searchPlaceholder: "Search by name, phone or reference...",
      filters: {
        all: "All",
        deposits: "Deposits",
        withdrawals: "Withdrawals",
      },
      loading: "Loading transactions...",
      noTransactions: "No transactions found",
      network: "Network",
      reference: "Reference",
      status: "Status",
      previous: "Previous",
      next: "Next",
    },

    // Recharge History Screen
    rechargeHistory: {
      title: "Recharge History",
      subtitle: "View all your mobile recharges",
      searchPlaceholder: "Search by amount or reference...",
      filters: {
        all: "All",
        approved: "Approved",
        pending: "Pending",
        rejected: "Rejected",
        proofSubmitted: "Proof Submitted",
      },
      loading: "Loading recharges...",
      noRecharges: "No recharges found",
      reference: "Reference",
      status: "Status",
      expired: "Expired",
      previous: "Previous",
      next: "Next",
    },

    // Profile Screen
    profile: {
      title: "Profile Settings",
      subtitle: "Manage your account information",
      tabs: {
        profile: "Profile",
        password: "Password",
      },
      fields: {
        email: "Email Address",
        phone: "Phone Number",
        firstName: "First Name",
        lastName: "Last Name",
        contactMethod: "Preferred Contact Method",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
      },
      buttons: {
        updateProfile: "Update Profile",
        changePassword: "Change Password",
        updating: "Updating...",
        changingPassword: "Changing Password...",
      },
      loading: "Loading profile...",
      contactMethods: {
        email: "Email",
        phone: "Phone",
      },
    },


    // Splash Screen
    splash: {
      loadingWallet: "Loading your wallet...",
      securingConnection: "Securing connection...",
      almostReady: "Almost ready!",
    },

    // Additional translations for hardcoded text
    additional: {
      // Dashboard screen
      hello: "Hello,",
      welcome: "Welcome",
      updatedNow: "Updated now",
      active: "Active",
      yourTransactionsWillAppearHere: "Your transactions will appear here",
      
      // Login screen
      loginFailed: "Login Failed",
      signingIn: "Signing in...",
      
      // Deposit screen
      transactionFailed: "Transaction Failed",
      
      // Withdraw screen
      withdrawalFailed: "Withdrawal Failed",
      
      // Recharge screen
      rechargeFailed: "Recharge Failed",
      tapToSelectImage: "Tap to select image",
      
      // Settings screen
      manageYourPreferences: "Manage your preferences",
      preferences: "Preferences",
      customizeYourAppExperience: "Customize your app experience",
      
      // Profile screen
      profileUpdateFailed: "Profile Update Failed",
      passwordChangeFailed: "Password Change Failed",
      
      // Common error messages
      pleaseFillInAllFields: "Please fill in all fields",
      pleaseEnterAnAmount: "Please enter an amount",
      noChangesToSave: "No changes to save",
      newPasswordsDoNotMatch: "New passwords do not match",
      newPasswordMustBeAtLeast6Characters: "New password must be at least 6 characters",
      failedToLoadProfile: "Failed to load profile",
      loginFailedPleaseTryAgain: "Login failed. Please try again.",
      
      // Common UI actions
      goBack: "Go Back",
      pullToRefresh: "Pull to refresh",
      releaseToRefresh: "Release to refresh",
      
      // Time-related translations
      time: {
        justNow: "Just now",
        hoursAgo: "{{count}}h ago",
        daysAgo: "{{count}}d ago",
        hourAgo: "1h ago",
        dayAgo: "1d ago",
        atTheMoment: "À l'instant",
        hoursAgoFull: "{{count}} hour{{plural}} ago",
        daysAgoFull: "{{count}} day{{plural}} ago",
        hourAgoFull: "1 hour ago",
        dayAgoFull: "1 day ago",
      },

      // Transaction history specific translations
      transactionHistory: {
        transactions: "transactions",
        all: "All",
        deposits: "Deposits",
        withdrawals: "Withdrawals",
        network: "Network",
        copyReference: "Copy reference",
        noTransactionsFound: "No transactions found",
        tryAdjustingSearchOrFilters: "Try adjusting your search or filters",
        loadingTransactions: "Loading transactions...",
        pageOf: "Page {{current}} of {{total}}",
        previous: "Previous",
        next: "Next",
        of: "of",
      },

      // Recharge history specific translations
      rechargeHistory: {
        recharges: "recharges",
        all: "All",
        approved: "Approved",
        pending: "Pending",
        rejected: "Rejected",
        underReview: "Under Review",
        unknown: "Unknown",
        copyReference: "Copy reference",
        noRechargesFound: "No recharges found",
        tryAdjustingSearchOrFilters: "Try adjusting your search or filters",
        loadingRecharges: "Loading recharges...",
        pageOf: "Page {{current}} of {{total}}",
        previous: "Previous",
        next: "Next",
        of: "of",
        status: "Status",
        expired: "Expired",
        searchPlaceholder: "Search recharges...",
      },
    },
  },
  fr: {
    // App Info
    app: {
      name: "Connect Pro",
      subtitle: "Partners",
      description: "Votre solution de portefeuille numérique de confiance",
    },

    // Splash Screen
    appName: "Connect Pro Partners",
    loading: "Chargement...",

    // Login Screen
    login: {
      welcome: "Bon Retour",
      subtitle: "Connectez-vous pour accéder à votre portefeuille",
      email: "Adresse e-mail",
      password: "Mot de passe",
      signIn: "Se Connecter en Sécurité",
      forgotPassword: "Mot de passe oublié?",
    },

    // Dashboard Screen
    dashboard: {
      greeting: "Bonjour,",
      userName: "Sarah Johnson",
      totalBalance: "Solde Total",
      growth: "+2,5% par rapport au mois dernier",
      actions: {
        deposit: "Dépôt",
        withdraw: "Retrait",
        recharge: "Recharge",
      },
      recentTransactions: "Transactions Récentes",
      transactions: {
        salary: "Dépôt de Salaire",
        grocery: "Épicerie",
        gas: "Station-Service",
        freelance: "Paiement Freelance",
        time: {
          hours: "Il y a {{count}} heures",
          days: "Il y a {{count}} jour",
        },
      },
      noTransactions: "Aucune transaction trouvée",
      transactionHistory: "Historique des Transactions",
      rechargeHistory: "Historique des Recharges",
      referenceCopied: "Référence Copiée",
      referenceCopiedDesc: "Référence de transaction copiée dans le presse-papiers",
      copyFailed: "Échec de la Copie",
      copyFailedDesc: "Impossible de copier la référence dans le presse-papiers",
    },

    // Deposit Screen
    deposit: {
      title: "Dépôt de Fonds",
      subtitle: "Ajouter de l'argent à votre portefeuille",
      amount: "Montant",
      amountPlaceholder: "Entrez le montant",
      method: "Méthode de Paiement",
      bankTransfer: "Virement Bancaire",
      creditCard: "Carte de Crédit",
      debitCard: "Carte de Débit",
      confirmDeposit: "Confirmer le Dépôt",
      processing: "Traitement...",
      success: "Dépôt Réussi",
      successMessage: "Vos fonds ont été ajoutés à votre portefeuille",
      quickAmount: "Montant rapide",
      recipientPhone: "Numéro de téléphone du destinataire",
      recipientPhonePlaceholder: "Entrez votre numéro de téléphone",
      selectNetwork: "Sélectionner le réseau",
      availableBalance: "Solde disponible",
      confirmDescription: "Veuillez vérifier les détails de votre dépôt avant de confirmer",
    },

    // Withdraw Screen
    withdraw: {
      title: "Retrait de Fonds",
      subtitle: "Transférer de l'argent de votre portefeuille",
      amount: "Montant",
      amountPlaceholder: "Entrez le montant",
      method: "Méthode de Retrait",
      bankAccount: "Compte Bancaire",
      paypal: "PayPal",
      crypto: "Cryptomonnaie",
      confirmWithdraw: "Confirmer le Retrait",
      processing: "Traitement...",
      success: "Retrait Réussi",
      successMessage: "Vos fonds ont été envoyés à votre compte",
      quickAmount: "Montant rapide",
      recipientPhone: "Numéro de téléphone du destinataire",
      recipientPhonePlaceholder: "Entrez votre numéro de téléphone",
      selectNetwork: "Sélectionner le réseau",
      availableBalance: "Solde disponible",
      confirmDescription: "Veuillez vérifier les détails de votre retrait avant de confirmer",
    },

    // Recharge Screen
    recharge: {
      title: "Services de Recharge",
      subtitle: "Rechargez votre mobile, internet et autres services",
      categories: {
        mobile: "Recharge Mobile",
        internet: "Internet et Câble",
        utilities: "Services Publics",
        gaming: "Jeux",
      },
      mobile: {
        title: "Recharge Mobile",
        subtitle: "Rechargez votre téléphone mobile",
        operators: "Sélectionner l'Opérateur",
        plans: "Plans Disponibles",
        data: "Plans de Données",
        voice: "Plans Vocaux",
        combo: "Plans Combo",
      },
      internet: {
        title: "Internet et Câble",
        subtitle: "Payez vos factures internet et câble",
        providers: "Sélectionner le Fournisseur",
        plans: "Plans Disponibles",
      },
      utilities: {
        title: "Services Publics",
        subtitle: "Payez les factures d'électricité, d'eau et de gaz",
        electricity: "Électricité",
        water: "Eau",
        gas: "Gaz",
      },
      gaming: {
        title: "Jeux",
        subtitle: "Rechargez les portefeuilles de jeux et abonnements",
        platforms: "Plateformes de Jeux",
        wallets: "Portefeuilles de Jeux",
      },
      selectPlan: "Sélectionner le Plan",
      confirmRecharge: "Confirmer la Recharge",
      processing: "Traitement...",
      success: "Recharge Réussie",
      successMessage: "Votre recharge a été effectuée avec succès",
      quickAmount: "Montant rapide",
      rechargeAmount: "Montant de recharge",
      proofDescription: "Description de la preuve (Optionnel)",
      proofDescriptionPlaceholder: "Décrivez votre preuve de recharge",
      proofImage: "Image de preuve (Optionnel)",
      uploadProofImage: "Télécharger l'image de preuve",
      availableBalance: "Solde disponible",
      creatingRecharge: "Création de la recharge...",
      createRecharge: "Créer la recharge",
      confirmDescription: "Veuillez vérifier les détails de votre recharge avant de confirmer",
    },

    // Footer
    footer: {
      secure: "Sécurisé",
      trusted: "Fiable",
      professional: "Professionnel",
      encryption: "Chiffrement SSL 256 bits",
    },

    // Settings Screen
    settings: {
      title: "Paramètres",
      account: {
        title: "Compte",
        subtitle: "Gérez les paramètres de votre compte",
        profile: "Profil",
        profileSubtitle: "Modifiez vos informations personnelles",
        payment: "Moyens de Paiement",
        paymentSubtitle: "Gérez vos options de paiement",
        language: "Langue",
        theme: "Thème",
        lightTheme: "Clair",
        darkTheme: "Sombre",
      },
      security: {
        title: "Sécurité et Confidentialité",
        subtitle: "Protégez votre compte et vos données",
        password: "Changer le Mot de Passe",
        passwordSubtitle: "Mettez à jour le mot de passe de votre compte",
        twoFactor: "Authentification à Deux Facteurs",
        enabled: "Activé",
        biometric: "Connexion Biométrique",
        biometricSubtitle: "Utilisez l'empreinte digitale ou la reconnaissance faciale",
      },
      notifications: {
        title: "Notifications",
        subtitle: "Contrôlez vos préférences de notification",
        push: "Notifications Push",
        pushSubtitle: "Recevez des notifications sur votre appareil",
        security: "Alertes de Sécurité",
        securitySubtitle: "Soyez notifié des événements de sécurité",
      },
      support: {
        help: "Centre d'Aide",
        helpSubtitle: "Obtenez de l'aide et du support",
      },
      logout: "Déconnexion",
    },

    // Theme Options
    light: "Clair",
    dark: "Sombre",
    system: "Système",

    // Language Options
    english: "English",
    french: "Français",

    // Navigation
    nav: {
      dashboard: "Tableau de bord",
      transactions: "Transactions",
      accountTransaction: "Transaction de compte",
      topup: "Recharge",
      transfer: "Transfert",
      logout: "Déconnexion",
      general: "Général",
      transactionManagement: "Gestion des transactions",
      history: "Historique",
      topupHistory: "Historique des recharges",
      bettingPlatforms: "Plateformes de Paris",
      platforms: "Plateformes",
      commissions: "Commissions",
      transferHistory: "Historique des transferts",
    },

    // Common UI Elements
    common: {
      loading: "Chargement...",
      search: "Rechercher",
      filter: "Filtrer",
      all: "Toutes",
      previous: "Précédent",
      next: "Suivant",
      copy: "Copier",
      download: "Télécharger",
      refresh: "Actualiser",
      save: "Enregistrer",
      cancel: "Annuler",
      confirm: "Confirmer",
      edit: "Modifier",
      delete: "Supprimer",
      close: "Fermer",
      back: "Retour",
      continue: "Continuer",
      retry: "Réessayer",
      success: "Succès",
      error: "Erreur",
      warning: "Avertissement",
      info: "Information",
      yes: "Oui",
      no: "Non",
      ok: "OK",
    },

    // Transaction History Screen
    transactionHistory: {
      title: "Historique des Transactions",
      subtitle: "Consultez toutes vos transactions",
      searchPlaceholder: "Rechercher par nom, téléphone ou référence...",
      filters: {
        all: "Toutes",
        deposits: "Dépôts",
        withdrawals: "Retraits",
      },
      loading: "Chargement des transactions...",
      noTransactions: "Aucune transaction trouvée",
      network: "Réseau",
      reference: "Référence",
      status: "Statut",
      previous: "Précédent",
      next: "Suivant",
    },

    // Recharge History Screen
    rechargeHistory: {
      title: "Historique des Recharges",
      subtitle: "Consultez toutes vos recharges mobiles",
      searchPlaceholder: "Rechercher par montant ou référence...",
      filters: {
        all: "Toutes",
        approved: "Approuvées",
        pending: "En attente",
        rejected: "Rejetées",
        proofSubmitted: "Preuves soumises",
      },
      loading: "Chargement des recharges...",
      noRecharges: "Aucune recharge trouvée",
      reference: "Référence",
      status: "Statut",
      expired: "Expiré",
      previous: "Précédent",
      next: "Suivant",
    },

    // Profile Screen
    profile: {
      title: "Paramètres du Profil",
      subtitle: "Gérez vos informations de compte",
      tabs: {
        profile: "Profil",
        password: "Mot de passe",
      },
      fields: {
        email: "Adresse e-mail",
        phone: "Numéro de téléphone",
        firstName: "Prénom",
        lastName: "Nom de famille",
        contactMethod: "Méthode de contact préférée",
        currentPassword: "Mot de passe actuel",
        newPassword: "Nouveau mot de passe",
        confirmPassword: "Confirmer le nouveau mot de passe",
      },
      buttons: {
        updateProfile: "Mettre à jour le profil",
        changePassword: "Changer le mot de passe",
        updating: "Mise à jour...",
        changingPassword: "Changement du mot de passe...",
      },
      loading: "Chargement du profil...",
      contactMethods: {
        email: "E-mail",
        phone: "Téléphone",
      },
    },

    // Splash Screen
    splash: {
      loadingWallet: "Chargement de votre portefeuille...",
      securingConnection: "Sécurisation de la connexion...",
      almostReady: "Presque prêt !",
    },

    // Additional translations for hardcoded text
    additional: {
      // Dashboard screen
      hello: "Bonjour,",
      welcome: "Bienvenue",
      updatedNow: "Mis à jour maintenant",
      active: "Actif",
      yourTransactionsWillAppearHere: "Vos transactions apparaîtront ici",
      
      // Login screen
      loginFailed: "Échec de la Connexion",
      signingIn: "Connexion en cours...",
      
      // Deposit screen
      transactionFailed: "Transaction Échouée",
      
      // Withdraw screen
      withdrawalFailed: "Retrait Échoué",
      
      // Recharge screen
      rechargeFailed: "Recharge Échouée",
      tapToSelectImage: "Appuyez pour sélectionner une image",
      
      // Settings screen
      manageYourPreferences: "Gérez vos préférences",
      preferences: "Préférences",
      customizeYourAppExperience: "Personnalisez votre expérience d'application",
      
      // Profile screen
      profileUpdateFailed: "Échec de la Mise à Jour du Profil",
      passwordChangeFailed: "Échec du Changement de Mot de Passe",
      
      // Common error messages
      pleaseFillInAllFields: "Veuillez remplir tous les champs",
      pleaseEnterAnAmount: "Veuillez entrer un montant",
      noChangesToSave: "Aucun changement à sauvegarder",
      newPasswordsDoNotMatch: "Les nouveaux mots de passe ne correspondent pas",
      newPasswordMustBeAtLeast6Characters: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      failedToLoadProfile: "Échec du chargement du profil",
      loginFailedPleaseTryAgain: "Échec de la connexion. Veuillez réessayer.",
      
      // Common UI actions
      goBack: "Retour",
      pullToRefresh: "Tirez pour actualiser",
      releaseToRefresh: "Relâchez pour actualiser",
      
      // Time-related translations
      time: {
        justNow: "À l'instant",
        hoursAgo: "Il y a {{count}}h",
        daysAgo: "Il y a {{count}}j",
        hourAgo: "Il y a 1h",
        dayAgo: "Il y a 1j",
        atTheMoment: "À l'instant",
        hoursAgoFull: "Il y a {{count}} heure{{plural}}",
        daysAgoFull: "Il y a {{count}} jour{{plural}}",
        hourAgoFull: "Il y a 1 heure",
        dayAgoFull: "Il y a 1 jour",
      },

      // Transaction history specific translations
      transactionHistory: {
        transactions: "transactions",
        all: "Tout",
        deposits: "Dépôts",
        withdrawals: "Retraits",
        network: "Réseau",
        copyReference: "Copier la référence",
        noTransactionsFound: "Aucune transaction trouvée",
        tryAdjustingSearchOrFilters: "Essayez d'ajuster votre recherche ou vos filtres",
        loadingTransactions: "Chargement des transactions...",
        pageOf: "Page {{current}} sur {{total}}",
        previous: "Précédent",
        next: "Suivant",
        of: "sur",
      },

      // Recharge history specific translations
      rechargeHistory: {
        recharges: "recharges",
        all: "Tout",
        approved: "Approuvé",
        pending: "En attente",
        rejected: "Rejeté",
        underReview: "En cours d'examen",
        unknown: "Inconnu",
        copyReference: "Copier la référence",
        noRechargesFound: "Aucune recharge trouvée",
        tryAdjustingSearchOrFilters: "Essayez d'ajuster votre recherche ou vos filtres",
        loadingRecharges: "Chargement des recharges...",
        pageOf: "Page {{current}} sur {{total}}",
        previous: "Précédent",
        next: "Suivant",
        of: "sur",
        status: "Statut",
        expired: "Expiré",
        searchPlaceholder: "Rechercher des recharges...",
      },
    },
  },
} as const

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
