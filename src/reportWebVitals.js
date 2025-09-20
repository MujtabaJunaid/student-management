import { reportWebVitals as reportVitalsFromWebVitals } from 'web-vitals';

const reportWebVitals = (metric) => {
  console.log(metric);  // You can replace this with custom logging or analytics
};

// Call the imported reportWebVitals function with your custom function
reportVitalsFromWebVitals(reportWebVitals);

// Export the custom function as the default export
export default reportWebVitals;
