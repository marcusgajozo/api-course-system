import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779412103736 implements MigrationInterface {
  name = 'AutoMigration1779412103736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."turmas_status_enum" AS ENUM('disponível', 'encerrado')`,
    );
    await queryRunner.query(
      `CREATE TABLE "turmas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE, "titulo" character varying NOT NULL, "descricao" character varying NOT NULL, "quantidade_vagas" integer NOT NULL, "status" "public"."turmas_status_enum" NOT NULL, "data_inicio" TIMESTAMP WITH TIME ZONE NOT NULL, "data_fim" TIMESTAMP WITH TIME ZONE NOT NULL, "curso_id" uuid NOT NULL, CONSTRAINT "PK_dc45a711f2b6358996a1ab1be6f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ADD CONSTRAINT "FK_24ee7ddcb692f9357e554686acb" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "turmas" DROP CONSTRAINT "FK_24ee7ddcb692f9357e554686acb"`,
    );
    await queryRunner.query(`DROP TABLE "turmas"`);
    await queryRunner.query(`DROP TYPE "public"."turmas_status_enum"`);
  }
}
