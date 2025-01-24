import { Navigation } from "@/components/Navigation";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto pt-24 pb-20 px-4">
        <h1 className="text-4xl font-bold mb-8">Terms & Use</h1>
        <div className="prose dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using this application, you agree to be bound by these Terms & Use and all applicable laws and regulations.</p>
          
          <h2>2. Trial Period</h2>
          <p>The trial period lasts for 40 hours from activation. After this period, you'll need to purchase a subscription to continue accessing premium features.</p>
          
          <h2>3. Use of Service</h2>
          <p>You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for all activity that occurs under your account.</p>
          
          <h2>4. Data Collection</h2>
          <p>We may collect and analyze usage data to improve our services. This includes but is not limited to wallet addresses, transaction history, and interaction patterns.</p>
          
          <h2>5. Disclaimer</h2>
          <p>This application is provided "as is" without warranty of any kind. We do not guarantee the accuracy of token analysis or investment advice.</p>
          
          <h2>6. Limitation of Liability</h2>
          <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
          
          <h2>7. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service after such modifications constitutes acceptance of the updated terms.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;