import styles from "../../styles/Post.module.css";
import PostContent from "../../components/PostContent";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { GetStaticPropsContext } from "next";
import {
  collection,
  collectionGroup,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { Post } from "../../interfaces/data-model";

// TODO: troobleshoot this file
export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { username, slug } = params ?? { username: "jdwy215", slug: "" };
  const userDoc = await getUserWithUsername(
    Array.isArray(username) ? username[0] : username ?? ""
  );

  let post;
  let path;

  if (userDoc) {
    // TODO: Implement logic to get indiv post given user doc
    // Users -> User -> Posts -> Post; How do I given a User doc get to the underlying post from the posts collection
    // const postRef = userDoc.ref.collection("posts").doc(slug);
    console.log({ userDoc: userDoc.data() });
    const postRef = doc(
      firestore,
      "users",
      userDoc.data().uid ?? "",
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
      UserPost
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post.heartCount ?? 0} 🤍</strong>
        </p>
      </aside>
    </main>
  );
}
