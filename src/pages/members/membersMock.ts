import type { Member } from './memberModel'

// UI fixtures only. Replace with the club member and invitation APIs when available.
export const memberClubMock = {
  name: 'D.Log 개발동아리',
  inviteCode: 'DB-DLOG',
  currentGeneration: '13기',
} as const

const names = [
  '정하늘', '윤민지', '강준호', '김동방', '이서연', '박지훈', '최유진', '김민준', '이도윤', '박서준',
  '오지우', '한서연', '정지호', '윤서아', '강민서', '조하준', '임수빈', '장예린', '신도현', '서지안',
  '홍유나', '문서진', '권시우', '황다은', '안준서', '송하린', '류건우', '백수아', '전지민', '유현우',
  '남은우', '고예원', '양승현', '손채원', '배태윤', '하소율', '차민재', '진나연', '노우진', '심가은',
  '성지후', '민서현', '우정우', '주예은', '구도하', '변다인', '김수현', '이지율', '박시윤', '최서우',
  '정은서', '강지훈', '윤하은', '조연우', '임채은', '한도경', '오민규', '서수연', '신재윤', '권다현',
  '황준영', '안유림', '송지완', '홍서윤',
]

export const membersMock: Member[] = names.map((name, index) => ({
  id: `member-${index + 1}`,
  name,
  studentId: String(20260001 + index),
  generation: `${11 + index % 3}기`,
  role: index < 3 ? '운영진' : index === 3 ? '회장' : index === 4 ? '총무' : '일반 회원',
  status: '활동',
  payment: index < 58 ? '납부 완료' : '미납',
}))
