import { useState } from "react";
import {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
  } from "@/components/ui/dialog"
  
type PopupFormProps = {
    button_ui: JSX.Element
}

const callDASTtools = () => {
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return;
}

export default function createTestPopUp (props: PopupFormProps) {
  const [formData, setFormData] = useState({ name: "", targetUrl: "" });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

    return (
      <div className="flex items-center justify-center h-screen">
        {/* Trigger Button */}
        <Dialog>
          <DialogTrigger asChild>
            {props.button_ui}
          </DialogTrigger>
  
          {/* Dialog Overlay */}
          <DialogPortal>
            <DialogOverlay className="fixed inset-0 bg-black/50 z-50" />
  
            {/* Dialog Content */}
            <DialogContent
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 z-50 shadow-lg"
            >
              <DialogTitle className="text-xl font-semibold">
                Create a Security Test
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-2">
                Enter the details of your web application
              </DialogDescription>
  
              {/* Form */}
              <form onSubmit = {callDASTtools}className="space-y-4 mt-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">
                    Test Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Default Test 1"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange = {handleInputChange}
                    value = {FormData.name}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="target-url" className="block text-sm font-medium">
                    Target URL
                  </label>
                  <input
                    id="targetUrl"
                    placeholder="https://example.com/"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value = {FormData.name}
                    onChange = {handleInputChange}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Start
                  </button>
                </div>
              </form>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    );
  };
  
  