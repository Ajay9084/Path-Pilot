"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import EntryForm from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

import { PDFDownloadLink } from "@react-pdf/renderer";
import ResumePDF from "./Resume-PDF";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [isClient, setIsClient] = useState(false); // <-- add this

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  const formValue = watch();

  // Ensure PDFDownloadLink renders only on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValue, activeTab]);

  useEffect(() => {
    if (saveResult && !isSaving) toast.success("Resume saved successfully!");
    if (saveError) toast.error(saveError.message || "Failed to save resume");
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValue;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);
    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>\n\n${parts.join(" | ")}`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValue;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

 const onSubmit = async () => {
  try {
    const markdownContent = getCombinedContent();
    await saveResumeFn({ content: markdownContent });
    toast.success("Resume saved successfully!");
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Failed to save resume");
  }
};


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2 flex flex-wrap gap-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save
              </>
            )}
          </Button>

          {/* PDF Download (Client-side only) */}
          {isClient && (
            <PDFDownloadLink
              document={<ResumePDF resumeData={formValue} user={user} />}
              fileName="resume.pdf"
            >
              {({ loading }) =>
                loading ? (
                  <Button disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </Button>
                ) : (
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )
              }
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        {/* Form */}
        <TabsContent value="edit">
          <form className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <Input {...register("contactInfo.email")} placeholder="Email" />
                <Input {...register("contactInfo.mobile")} placeholder="Mobile" />
                <Input {...register("contactInfo.linkedin")} placeholder="LinkedIn" />
                <Input {...register("contactInfo.twitter")} placeholder="Twitter/X" />
              </div>
            </div>

            {/* Summary */}
            <Controller
              name="summary"
              control={control}
              render={({ field }) => <Textarea {...field} placeholder="Summary" />}
            />

            {/* Skills */}
            <Controller
              name="skills"
              control={control}
              render={({ field }) => <Textarea {...field} placeholder="Skills" />}
            />

            {/* Experience */}
            <Controller
              name="experience"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Experience"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Education */}
            <Controller
              name="education"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Education"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Projects */}
            <Controller
              name="projects"
              control={control}
              render={({ field }) => (
                <EntryForm
                  type="Project"
                  entries={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </form>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <MDEditor
            value={previewContent}
            onChange={setPreviewContent}
            height={600}
            preview={resumeMode}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
