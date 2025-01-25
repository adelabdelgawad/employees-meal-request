import AlertStack from "./AlertStack";
import s from "./s";

export default function App() {
  const { alerts, addAlert } = s();

  const showAlert = (
    message: string,
    type?: "success" | "warning" | "error"
  ) => {
    addAlert(message, type);
  };

  return (
    <div className="p-8">
      <button
        onClick={() => showAlert("This is a success message!")}
        className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
      >
        Show Default (Success)
      </button>
      <button
        onClick={() => showAlert("This is a warning message!", "warning")}
        className="bg-yellow-500 text-white px-4 py-2 rounded-lg mr-2"
      >
        Show Warning
      </button>
      <button
        onClick={() => showAlert("This is an error message!", "error")}
        className="bg-red-500 text-white px-4 py-2 rounded-lg"
      >
        Show Error
      </button>

      {/* AlertStack Component */}
      <AlertStack alerts={alerts} onRemove={() => {}} />
    </div>
  );
}
