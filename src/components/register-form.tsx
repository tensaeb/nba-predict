// components/register-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// Remove this: import { saveUserInfo } from "@/lib/mongodb";
import { registerUserAction } from "@/app/actions"; // Import the server action

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
});

type FormData = z.infer<typeof formSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null); // State for server errors

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset, // Optional: reset form on success
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", phone: "" },
  });

  // Option 1: Using RHF's handleSubmit to call the action
  async function onSubmit(values: FormData) {
    setIsSubmitting(true);
    setServerError(null); // Clear previous errors

    // Create FormData for the action
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("phone", values.phone);

    const result = await registerUserAction(formData);

    if (result.success && result.userId) {
      localStorage.setItem("userId", result.userId);
      localStorage.setItem("userName", values.name);
      router.push("/brackets");
      reset(); // Optional: clear the form
    } else {
      console.error("Server Action Error:", result.error);
      setServerError(result.error || "An unknown error occurred.");
    }

    setIsSubmitting(false);
  }

  // Option 2: Using the form action prop (simpler for basic cases)
  // const formAction = async (formData: FormData) => {
  //   setIsSubmitting(true);
  //   setServerError(null);
  //   const result = await registerUserAction(formData);
  //   if (result.success && result.userId) {
  //     localStorage.setItem("userId", result.userId);
  //     localStorage.setItem("userName", formData.get('name') as string); // Get name from FormData
  //     router.push("/brackets");
  //   } else {
  //      console.error("Server Action Error:", result.error);
  //      setServerError(result.error || "An unknown error occurred.");
  //   }
  //   setIsSubmitting(false);
  // }

  return (
    // If using Option 1 (RHF handleSubmit):
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* If using Option 2 (form action prop): */}
      {/* <form action={formAction} className="space-y-6"> */}
      {/* Display Server Error */}
      {serverError && (
        <p className="text-sm font-medium text-red-500">{serverError}</p>
      )}

      {/* Name Input */}
      <div className="space-y-2">
        <label htmlFor="name" /* ... */> Name </label>
        <input
          id="name"
          /* ... */ placeholder="Enter your name"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm font-medium text-red-500">
            {" "}
            {errors.name.message}{" "}
          </p>
        )}
      </div>

      {/* Phone Input */}
      <div className="space-y-2">
        <label htmlFor="phone" /* ... */> Phone Number </label>
        <input
          id="phone"
          /* ... */ placeholder="Enter your phone number"
          {...register("phone")}
        />
        {errors.phone && (
          <p className="text-sm font-medium text-red-500">
            {" "}
            {errors.phone.message}{" "}
          </p>
        )}
        <p className="text-sm text-gray-500">
          {" "}
          We'll only use this to identify your prediction.{" "}
        </p>
      </div>

      <button type="submit" disabled={isSubmitting} /* ... */>
        {isSubmitting ? "Submitting..." : "Start Predicting"}
      </button>
    </form>
  );
}
