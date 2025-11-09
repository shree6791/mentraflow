// Shared pricing plans data
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    period: '/ month',
    subtitle: 'Best for Students',
    features: [
      'Up to 50 notes',
      'Adaptive recall',
      'Weekly progress tracking'
    ],
    popular: false,
    ctaText: 'Start Free'
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 9.99,
    period: '/ month',
    subtitle: 'Best for Consultants',
    features: [
      'Unlimited notes',
      'Integrations (Notion, Slack, ChatGPT)',
      'Retention analytics',
      'Recall reminders'
    ],
    popular: true,
    ctaText: 'Try Pro'
  },
  {
    id: 'teams',
    name: 'Teams Plan',
    price: 14.99,
    period: '/ user / month',
    subtitle: 'Best for Organizations',
    features: [
      'Multi-seat dashboards',
      'Team analytics',
      'Priority support',
      'Custom integrations'
    ],
    popular: false,
    ctaText: 'Schedule Consultation',
    minUsers: 2
  }
];

// Get only upgrade plans (exclude free)
export const getUpgradePlans = () => {
  return PRICING_PLANS.filter(plan => plan.id !== 'free');
};

// Get all plans
export const getAllPlans = () => {
  return PRICING_PLANS;
};

// Get plan by ID
export const getPlanById = (planId) => {
  return PRICING_PLANS.find(plan => plan.id === planId);
};
