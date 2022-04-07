import styles from "../../styles/Post.module.css";
import PostContent from "../../components/PostContent";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { GetStaticPropsContext } from "next";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const { username, slug } = params ?? { username: "jdwy215", slug: "" };
  const userDoc = await getUserWithUsername(
    Array.isArray(username) ? username[0] : username ?? ""
  );

  let post;
  let path;

  const docData = userDoc?.data();

  if (userDoc) {
    // TODO: Implement logic to get indiv post given user doc
    // Users -> User -> Posts -> Post; How do I given a User doc get to the underlying post from the posts collection
    // const postRef = userDoc.ref.collection("posts").doc(slug);
    //post = postToJSON(await postRef.get());
    // path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 5000,
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
    fallback: "blocking",
  };
}

export default function UserPost({}) {
  return <main className={styles.container}>UserPost</main>;
}
