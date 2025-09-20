import { reportWebVitals } from 'web-vitals';

// Simply use the imported function to log metrics or send them to an analytics endpoint
const reportWebVitalsFunction = (metric) => {
  console.log(metric); // You can replace this with custom logic for reporting
};

reportWebVitals(reportWebVitalsFunction); // Call the imported function with the custom reporting function
