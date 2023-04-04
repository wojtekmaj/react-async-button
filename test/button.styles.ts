import styled from 'styled-components';

export const Button = styled.button`
  background: transparent;
  border-radius: 3px;
  border: 2px solid;
  padding: 0.25em 1em;
  color: palevioletred;
  cursor: pointer;

  &:disabled {
    color: #999;
    cursor: not-allowed;
  }
`;
