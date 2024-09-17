
export default (props) => {
  const data=props.data

  return (
    <span className="total-value-renderer">
      <span>{data.userid.userId}</span>
      {/* <button onClick={() => alert(`USERID: ${data.userid.userId}`)}>
       view Details
      </button> */}
    </span>
  );
};