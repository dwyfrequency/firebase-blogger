import type { NextPage } from "next";
import toast from "react-hot-toast";
import PostFeed from "../components/PostFeed";
import Loader from "../components/Loader";
import { firestore, fromMillis, postToJSON } from "../lib/firebase";

import { useState } from "react";
import { Post } from "../interfaces/data-model";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { orderBy } from "lodash";

// Max post to query per page
const LIMIT = 1;

export async function getServerSideProps() {
  const q = query(
    collection(firestore, "posts"),
    where("published", "==", true),
    limit(LIMIT)
  );
  // TODO add --> orderBy()
  const posts = (await getDocs(q)).docs.map(postToJSON);
  return {
    props: { posts }, // will be passed to the page component as props
  };
}

const Home = (props: { posts: Post[] }) => {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    // todo implement function
  };

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && "You have reached the end!"}
    </main>
  );
};

export default Home;
