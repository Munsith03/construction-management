import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { submitOrder } from "../../services/orderService";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardError, setCardError] = useState(null);
  const [order, setOrder] = useState(null);

  console.log("Stripe:", stripe, "Elements:", elements);

  useEffect(() => {
    console.log("Location State:", state);
    if (!state?.cart || !state?.address || !state?.paymentMethod) {
      navigate("/cart");
    }
  }, [state, navigate]);

  const handleCardChange = (event) => {
    console.log("Card Event:", event);
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    console.log("handlePayment triggered");
    setIsLoading(true);
    setError("");
    setCardError(null);

    try {
      const orderData = {
        restaurantId: state.cart[0]?.restaurant,
        items: state.cart.map((item) => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          price: item.price,
        })),
        address: state.address,
        paymentMethod: state.paymentMethod,
      };
      console.log("Order Data:", orderData);

      const response = await submitOrder({
        ...orderData,
        paymentIntent: true,
      });
      console.log("SubmitOrder Response:", response.data);

      const { clientSecret, order: createdOrder } = response.data;
      console.log("Client Secret:", clientSecret);

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
          },
        });
      console.log("Payment Intent:", paymentIntent);

      if (stripeError) {
        console.error("Stripe Error:", stripeError);
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === "succeeded") {
        console.log("Setting order:", createdOrder);
        setOrder(createdOrder);
      } else {
        throw new Error("Payment failed");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!state?.cart) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg ">
          Error: Cart information is missing. Please return to the cart.
        </div>
        <button
          onClick={() => navigate("/cart")}
          className="mt-4 px-6 py-3 bg-black text-white rounded-lg hover:bg-black transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Go to Cart
        </button>
      </div>
    );
  }

  const total = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-6xl mx-auto pt-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        Complete Your Payment
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {order ? (
        <div className="bg-white pt-8 rounded-lg ">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Payment Successful!
          </h3>
          <p className="text-gray-600 mb-2">Order ID: {order._id}</p>
          <p className="text-gray-600 mb-2">Total: ${order.total.toFixed(2)}</p>
          <p className="text-gray-600 mb-4">Payment Method: Card</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-black text-white rounded-lg  hover:bg-black transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Details (Left) */}
          <div className="border p-6 rounded-lg ">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Details
            </h3>
            <form onSubmit={handlePayment}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="card-number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Card Number
                  </label>
                  <CardNumberElement
                    id="card-number"
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#424770",
                          fontFamily: '"Inter", sans-serif',
                          lineHeight: "1.5",
                          padding: "12px",
                          "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146", iconColor: "#9e2146" },
                      },
                      showIcon: true,
                    }}
                    className="p-4 border border-gray-300 rounded-lg bg-white  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[56px] transition duration-200"
                    onChange={handleCardChange}
                    aria-describedby="card-number-error"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="card-expiry"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiry Date
                    </label>
                    <CardExpiryElement
                      id="card-expiry"
                      options={{
                        style: {
                          fontSize: "16px",
                          color: "#424770",
                          fontFamily: '"Inter", sans-serif',
                          lineHeight: "1.5",
                          padding: "12px",
                          "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146", iconColor: "#9e2146" },
                      }}
                      className="p-4 border border-gray-300 rounded-lg bg-white  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[56px] transition duration-200"
                      onChange={handleCardChange}
                      aria-describedby="card-expiry-error"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-cvc"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVC
                    </label>
                    <CardCvcElement
                      id="card-cvc"
                      options={{
                        style: {
                          fontSize: "16px",
                          color: "#424770",
                          fontFamily: '"Inter", sans-serif',
                          lineHeight: "1.5",
                          padding: "12px",
                          "::placeholder": { color: "#aab7c4" },
                        },
                        invalid: { color: "#9e2146", iconColor: "#9e2146" },
                      }}
                      className="p-4 border border-gray-300 rounded-lg bg-white  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[56px] transition duration-200"
                      onChange={handleCardChange}
                      aria-describedby="card-cvc-error"
                    />
                  </div>
                </div>
                {cardError && (
                  <p
                    id="card-error"
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                  >
                    {cardError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className="mt-6 w-full px-6 py-3 bg-black text-white rounded-lg  hover:bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition duration-200"
                aria-label={isLoading ? "Processing payment" : "Pay now"}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay $${total.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary (Right) */}
          <div className="border p-6 rounded-lg ">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h3>
            {state.cart.map((item) => (
              <div
                key={item.menuItem}
                className="flex items-center border-b border-gray-200 py-4 last:border-b-0"
              >
                <img
                  src={
                    item.image
                      ? `${import.meta.env.VITE_API_RESTAURANT_BASE_URL}${
                          item.image
                        }`
                      : "https://via.placeholder.com/100x100?text=No+Image"
                  }
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                  loading="lazy"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-800">
                    {item.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    ${item.price.toFixed(2)} x {item.quantity}
                  </p>
                </div>
                <p className="text-gray-800 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
            <div className="mt-6">
              <p className="text-lg font-bold text-gray-900">
                Total: ${total.toFixed(2)}
              </p>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Delivery Address
              </h4>
              <p className="text-gray-600 mt-1">
                {state.address.street}, {state.address.city},{" "}
                {state.address.state} {state.address.zipcode},{" "}
                {state.address.countryCode}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentPage() {
  const [stripeInstance, setStripeInstance] = useState(null);

  useEffect(() => {
    stripePromise
      .then((stripe) => {
        console.log("Stripe instance loaded:", stripe);
        setStripeInstance(stripe);
      })
      .catch((error) => {
        console.error("Failed to load Stripe:", error);
      });
  }, []);

  if (!stripeInstance) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <p className="text-gray-600 text-center">Loading payment form...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripeInstance}>
      <PaymentForm />
    </Elements>
  );
}

export default PaymentPage;
