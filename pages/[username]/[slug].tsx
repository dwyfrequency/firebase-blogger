import styles from "../../styles/Post.module.css";
import PostContent from "../../components/PostContent";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { GetStaticPropsContext } from "next";
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Post } from "../../interfaces/data-model";
import HeartButton from "../../components/HeartButton";
import AuthCheck from "../../components/AuthCheck";
import Link from "next/link";

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { username, slug } = params ?? { username: "jdwy215", slug: "" };
  const userDoc = await getUserWithUsername(
    Array.isArray(username) ? username[0] : username ?? ""
  );

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(
      firestore,
      userDoc.ref.path,
      "posts",
      Array.isArray(slug) ? slug[0] : slug ?? ""
    );
    post = postToJSON(await getDoc(postRef)) as Post;
    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000, // regenerate this page on server every 5k
  };
}

export async function getStaticPaths() {
  const q = query(
    collectionGroup(firestore, "posts"),
    where("published", "==", true),
    orderBy("createdAt", "desc")
  );

  const paths = (await getDocs(q)).docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    // must be in this format:
    // paths: [
    //   { params: { username, slug }}
    // ],
    paths,
    // when user comes to page that is not generated yet (new post), it tells next to fall back to regular server side rendering
    fallback: "blocking",
  };
}

interface UserPostProps {
  path: string;
  paths: {
    username: string;
    slug: string;
  };
  post: Post;
}

// TODO: Update function
export default function UserPost({ path, post: postProp }: UserPostProps) {
  const postRef = doc(firestore, path);
  const [realtimePost] = useDocumentData(postRef);

  const post = (realtimePost ?? postProp) as Post;

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post.heartCount ?? 0} ????</strong>
        </p>
        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>???? Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
