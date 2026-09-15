import { Modal } from '../common'
import './helpGuideModal.css'

type HelpGuideModalProps = {
  open: boolean
  onClose: () => void
}

const guideSteps = [
  {
    title: '01 · 동아리 준비',
    description: '동아리 설정에서 소개, 학기, 납부 항목과 입금 계좌를 등록하세요. 멤버 초대 링크를 공유하면 새로운 부원을 편리하게 초대할 수 있어요.',
  },
  {
    title: '02 · 일정과 행사',
    description: '일정 등록은 캘린더에 일정을 표시해요. 행사로 등록하면 정원과 신청 마감을 설정하고 참가 신청 현황까지 관리할 수 있어요.',
  },
  {
    title: '03 · QR 출석',
    description: '행사를 선택해 출석·미출석 명단을 확인하세요. 현장 확인 후 수정 사유를 남기고 출석 상태를 정확하게 관리할 수 있어요.',
  },
  {
    title: '04 · 투명한 납부 관리',
    description: '납부 현황에서 입금을 확인하고, 출금 내역에 영수증 사진과 지출 내용을 등록하세요. 모든 내역은 멤버에게 투명하게 공유돼요.',
  },
]

export function HelpGuideModal({ open, onClose }: HelpGuideModalProps) {
  return <Modal open={open} title="DongBang 운영 가이드" className="help-guide-modal" onClose={onClose}>
    <div className="help-guide-list">
      {guideSteps.map((step) => <section key={step.title}><h3>{step.title}</h3><p>{step.description}</p></section>)}
    </div>
  </Modal>
}
