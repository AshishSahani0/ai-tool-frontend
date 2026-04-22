import ToolSubmitForm from "@/components/ToolSubmitForm";



export const metadata = {
  title: "Submit an AI Tool",
  description: "Submit your AI tool for review and listing",
};

export default function AddToolPage() {
  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">
          Submit Your AI Tool
        </h1>
        <p className="text-gray-600 mb-10">
          Your tool will be reviewed by our team before publishing.
          If not loged in please login to submit your tool.
        </p>

        <ToolSubmitForm />
      </main>
    </>
  );
}