
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
          
          <h2>2. Service Description</h2>
          <p>This platform provides real-time tracking and analysis tools for tokens on the PumpFun ecosystem. We use WebSocket connections to stream live data from PumpPortal's API and present analytics and insights to users.</p>
          
          <h2>3. Risk Disclosure</h2>
          <p>Cryptocurrency trading involves substantial risk. The volatility and unpredictability of token values can lead to significant losses. Our analytics and insights are for informational purposes only and should not be considered financial advice.</p>
          
          <h2>4. Data Accuracy</h2>
          <p>While we strive to provide accurate and timely information through our integration with PumpPortal's data API, we cannot guarantee the accuracy, completeness, or timeliness of the data. Users should verify all information independently.</p>
          
          <h2>5. API Usage</h2>
          <p>Our service utilizes PumpPortal's WebSocket API for real-time data. Connection stability and data availability are dependent on third-party services. We aim to maintain consistent connectivity but cannot guarantee uninterrupted service.</p>
          
          <h2>6. Trial Period</h2>
          <p>The trial period lasts for 40 hours from activation. After this period, you'll need to purchase a subscription to continue accessing premium features.</p>
          
          <h2>7. Limitations</h2>
          <p>We are not responsible for any delays, interruptions, or errors in the streaming data. Users acknowledge that real-time market data may occasionally be delayed or inaccurate.</p>
          
          <h2>8. Prohibited Activities</h2>
          <p>Users are prohibited from attempting to manipulate, reverse engineer, or exploit the platform or its data streams. Any unauthorized use of our services may result in immediate termination of access.</p>
          
          <h2>9. Changes to Service</h2>
          <p>We reserve the right to modify, suspend, or discontinue any part of the service without prior notice. This includes changes to the data streams, analytics features, or user interface.</p>
          
          <h2>10. Disclaimer</h2>
          <p>This application is provided "as is" without warranty of any kind. We do not guarantee the accuracy of token analysis or investment advice. Users trade at their own risk.</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
