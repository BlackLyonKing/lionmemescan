import { PaymentGate } from "@/components/PaymentGate";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-8">
        <PaymentGate onPaymentSuccess={() => window.location.href = '/'} />
      </div>
    </div>
  );
};

export default Pricing;