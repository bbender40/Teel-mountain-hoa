"use client";

import { ChangeEvent, DragEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "../../lib/supabase-browser";

type DocumentCategory = "Meeting Minutes" | "Covenants" | "By-Laws";

type CommunityDocument = {
  id: string;
  title: string;
  category: DocumentCategory;
  description: string | null;
  file_url: string;
  created_at: string;
  signedUrl?: string;
};

const categories: DocumentCategory[] = ["Meeting Minutes", "Covenants", "By-Laws"];

export default function MembersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [documents, setDocuments] = useState<CommunityDocument[]>([]);
  const [documentsError, setDocumentsError] = useState("");
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>("Meeting Minutes");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let isMounted = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!isMounted) return;
      if (!data.user) {
        router.replace("/login?redirectedFrom=/members");
        return;
      }
      setUser(data.user);
      setIsAdmin(data.user.app_metadata?.role === "admin");
      setIsChecking(false);
      setIsLoadingDocuments(true);
      const { data: documentData, error: documentError } = await supabase
        .from("documents")
        .select("id, title, category, description, file_url, created_at")
        .in("category", categories)
        .order("created_at", { ascending: false });

      if (!isMounted) return;
      if (documentError) setDocumentsError("Documents are temporarily unavailable. Please contact the association office.");
      else {
        const signedDocuments = await Promise.all((documentData ?? []).map(async (document) => {
          const { data: signed } = await supabase.storage.from("hoa-documents").createSignedUrl(document.file_url, 3600);
          return { ...document, signedUrl: signed?.signedUrl };
        }));
        setDocuments(signedDocuments as CommunityDocument[]);
      }
      setIsLoadingDocuments(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) router.replace("/login?redirectedFrom=/members");
      else {
        setUser(session.user);
        setIsAdmin(session.user.app_metadata?.role === "admin");
      }
    });

    return () => { isMounted = false; listener.subscription.unsubscribe(); };
  }, [router]);

  async function signOut() {
    await createSupabaseBrowserClient().auth.signOut();
    router.replace("/");
  }

  function validateFile(file: File | undefined) {
    if (!file) return "Choose a PDF to upload.";
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files can be uploaded.";
    return "";
  }

  async function uploadDocument(file: File | undefined) {
    const validationError = validateFile(file);
    if (validationError || !file || !uploadTitle.trim()) {
      setUploadError(validationError || "Add a document title before uploading.");
      return;
    }

    setUploadError("");
    setIsUploading(true);
    const supabase = createSupabaseBrowserClient();
    const storagePath = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: storageError } = await supabase.storage.from("hoa-documents").upload(storagePath, file, { contentType: "application/pdf", upsert: false });

    if (storageError) {
      setUploadError("The PDF could not be uploaded. Check the storage bucket policies and try again.");
      setIsUploading(false);
      return;
    }

    const { data: newDocument, error: documentError } = await supabase.from("documents").insert({ title: uploadTitle.trim(), category: uploadCategory, file_url: storagePath }).select("id, title, category, description, file_url, created_at").single();
    if (documentError) {
      await supabase.storage.from("hoa-documents").remove([storagePath]);
      setUploadError("The file uploaded but could not be added to the document library.");
      setIsUploading(false);
      return;
    }

    const { data: signed } = await supabase.storage.from("hoa-documents").createSignedUrl(storagePath, 3600);
    setDocuments((current) => [{ ...(newDocument as CommunityDocument), signedUrl: signed?.signedUrl }, ...current]);
    setUploadTitle("");
    setIsUploading(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    void uploadDocument(event.dataTransfer.files[0]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    void uploadDocument(event.target.files?.[0]);
    event.target.value = "";
  }

  if (isChecking || !user) return <main className="members-loading"><p>Opening your resident portal...</p></main>;

  return (
    <main className="members-page">
      <header className="members-header wrap"><Link className="auth-brand" href="/">Teel Mountain <span>HOA</span></Link><button className="sign-out" onClick={signOut}>Sign out <span aria-hidden="true">↗</span></button></header>
      <section className="members-content wrap"><p className="eyebrow">Resident portal</p><h1>Good morning,<br /><i>{user.email?.split("@")[0] || "neighbor"}.</i></h1>{isAdmin && <section className="upload-panel"><div><span className="member-label">Admin tools</span><h2>Add a community document</h2><p>Upload a PDF to the secure resident library.</p></div><div className="upload-fields"><label htmlFor="document-title">Document title<input id="document-title" value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder="e.g. October 2026 Meeting Minutes" /></label><label htmlFor="document-category">Document type<select id="document-category" value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value as DocumentCategory)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label></div><label className={`dropzone${isDragging ? " is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}><input type="file" accept="application/pdf,.pdf" onChange={handleFileChange} disabled={isUploading} /><strong>{isUploading ? "Uploading PDF..." : "Drop a PDF here or choose a file"}</strong><span>PDF files only</span></label>{uploadError && <p className="upload-error" role="alert">{uploadError}</p>}</section>}<div className="dashboard-heading"><div><span className="member-label">Community library</span><h2>Documents &amp; resources</h2></div><p>Everything you need to stay connected to life at Teel Mountain.</p></div>{documentsError && <p className="documents-error" role="alert">{documentsError}</p>}{isLoadingDocuments ? <p className="documents-status">Loading community documents...</p> : <div className="document-sections">{categories.map((category) => { const categoryDocuments = documents.filter((document) => document.category === category); return <section className="document-section" key={category}><div className="document-section-heading"><h3>{category}</h3><span>{categoryDocuments.length} documents</span></div>{categoryDocuments.length > 0 ? categoryDocuments.map((document) => <article className="document-row" key={document.id}><div><h4>{document.title}</h4>{document.description && <p>{document.description}</p>}<span>{new Date(document.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div>{document.signedUrl && <a href={document.signedUrl} target="_blank" rel="noreferrer" aria-label={`Open ${document.title}`}>Open <span aria-hidden="true">↗</span></a>}</article>) : <p className="empty-documents">No {category.toLowerCase()} have been added yet.</p>}</section>; })}</div>}</section>
    </main>
  );
}