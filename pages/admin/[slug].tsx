import AuthCheck from "../../components/AuthCheck";
import styles from "../../styles/Admin.module.css";
import { firestore, auth } from "../../lib/firebase";

import { useState } from "react";
import { useRouter } from "next/router";

import { useDocumentData } from "react-firebase-hooks/firestore";
import { SubmitHandler, useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Post } from "../../interfaces/data-model";
export default function AdminPostEdit({}) {
  return (
    <main>
      <AuthCheck>
        <PostManager />
      </AuthCheck>
    </main>
  );
}

function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(
    firestore,
    "users",
    auth.currentUser?.uid ?? "",
    "posts",
    Array.isArray(slug) ? slug[0] : slug ?? ""
  );
  const [postData] = useDocumentData(postRef);
  const post = postData as Post;

  return (
    <main className={styles.container}>
      {post && (
        <>
          <section>
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            />
          </section>

          <aside>
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? "Edit" : "Preview"}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live view</button>
            </Link>
          </aside>
        </>
      )}
    </main>
  );
}

interface PostFormProps {
  defaultValues: Post;
  postRef: DocumentReference<DocumentData>;
  preview: boolean;
}

function PostForm({ defaultValues, postRef, preview }: PostFormProps) {
  const { register, handleSubmit, reset, watch } = useForm<Post>({
    defaultValues,
    mode: "onChange",
  });

  // Can't really find the correct type here but this works
  const updatePost = async (data: unknown) => {
    const { content, published } = data as Post;
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success("Post updated successfully!");
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch("content")}</ReactMarkdown>
        </div>
      )}

      <div className={preview ? styles.hidden : styles.controls}>
        <textarea {...register("content")}></textarea>

        <fieldset>
          <input
            className={styles.checkbox}
            {...register("published")}
            type="checkbox"
          />
          <label>Published</label>
        </fieldset>

        <button type="submit" className="btn-green">
          Save Changes
        </button>
      </div>
    </form>
  );
}
